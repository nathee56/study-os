import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import webPush from 'web-push';
import { THAILLM_BASE, MODELS } from '@/lib/thaillm';

export async function GET(req: NextRequest) {
  // Verify Vercel Cron Secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidEmail = process.env.VAPID_EMAIL || 'mailto:noreply@jamdai.app';

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    webPush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

    const { dbAdmin } = getFirebaseAdmin();
    
    // 1. Get all users
    const usersSnapshot = await dbAdmin.collection('users').get();
    let sentCount = 0;
    const errors: string[] = [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบตดี', 'ศุกร์', 'เสาร์'];
    const currentDayName = dayNames[now.getDay()];

    // Process each user sequentially to avoid overwhelming LLM API or getting rate limited
    for (const userDoc of usersSnapshot.docs) {
      const uid = userDoc.id;

      try {
        // Check if user has push subscriptions
        const subsSnapshot = await dbAdmin.collection('users').doc(uid).collection('push_subscriptions').get();
        if (subsSnapshot.empty) continue; // Skip users without subscriptions

        // 2. Fetch User Data
        const [todosSnap, scheduleSnap] = await Promise.all([
          dbAdmin.collection('users').doc(uid).collection('todos')
            .where('done', '==', false)
            .get(),
          dbAdmin.collection('users').doc(uid).collection('schedule')
            .where('day', '==', currentDayName)
            .get()
        ]);

        const pendingTodos = todosSnap.docs.map(doc => {
          const data = doc.data();
          return {
            title: data.title,
            subject: data.subject,
            dueDate: data.dueDate?.toDate() || null,
          };
        }).filter(t => t.dueDate && t.dueDate < new Date(tomorrow.getTime() + 86400000)); // Due today or tomorrow

        const todayClasses = scheduleSnap.docs.map(doc => doc.data());

        // Skip if no urgent todos and no classes today
        if (pendingTodos.length === 0 && todayClasses.length === 0) continue;

        // 3. Generate personalized message using ThaiLLM
        const prompt = `
วิเคราะห์ข้อมูลแล้วเขียนข้อความแจ้งเตือน (Push Notification) แบบสั้นๆ สรุปให้ผู้ใช้ฟังสำหรับวันนี้ (เช้าเวลา 08:00 น.)
- ต้องสั้น กระชับ ไม่เกิน 1-2 ประโยค
- โทนเสียงเป็นมิตร ให้กำลังใจ หรือเตือนสติ
- ไม่ต้องมีคำขึ้นต้นหรือลงท้าย (เช่น ไม่ต้องมี สวัสดีครับ)

ข้อมูลวันนี้:
งานที่ใกล้ส่ง: ${pendingTodos.length > 0 ? pendingTodos.map(t => `"${t.title}" (${t.subject || '-'})`).join(', ') : 'ไม่มี'}
คาบเรียนวันนี้: ${todayClasses.length > 0 ? todayClasses.map(c => `วิชา ${c.subject} (${c.startTime})`).join(', ') : 'ไม่มี'}
`;

        const apiKey = process.env.THAILLM_API_KEY;
        let aiResponseText = 'คุณมีงานหรือคาบเรียนที่ต้องจัดการวันนี้ เข้าไปดูในแอปเลย!';

        if (apiKey) {
          try {
            const llmRes = await fetch(`${THAILLM_BASE}/chat/completions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: MODELS.openthaigpt,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 250,
                temperature: 0.3,
              }),
            });
            if (llmRes.ok) {
              const data = await llmRes.json();
              aiResponseText = data.choices?.[0]?.message?.content || aiResponseText;
              aiResponseText = aiResponseText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            }
          } catch (e) {
            console.error('LLM generation failed for cron', e);
          }
        }

        // 4. Send Push Notification to all user's devices
        const payload = JSON.stringify({
          title: '🌤️ สรุปแผนวันนี้',
          body: aiResponseText.trim(),
          icon: '/icon-192.png',
          url: '/app',
        });

        for (const subDoc of subsSnapshot.docs) {
          const subscriptionData = subDoc.data() as webPush.PushSubscription;
          try {
            await webPush.sendNotification(subscriptionData, payload);
            sentCount++;
          } catch (pushErr: any) {
            if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
              // Subscription expired or invalid, delete it
              await subDoc.ref.delete();
            } else {
              console.error(`Failed to send to sub ${subDoc.id}:`, pushErr);
            }
          }
        }
      } catch (userErr: any) {
        console.error(`Error processing user ${uid}:`, userErr);
        errors.push(`User ${uid}: ${userErr.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cron check completed. Sent ${sentCount} notifications.`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Cron check error:', error);
    return NextResponse.json(
      { error: 'Cron check failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
