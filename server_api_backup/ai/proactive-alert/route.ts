import { NextRequest, NextResponse } from 'next/server';
import { THAILLM_BASE, MODELS } from '@/lib/thaillm';

export async function POST(req: NextRequest) {
  try {
    const { todos, schedule, memories, currentTime } = await req.json();
    const apiKey = process.env.THAILLM_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ alerts: [] });
    }

    const alertPrompt = `คุณคือระบบวางแผนการเรียนอัจฉริยะของ JamDai (Study OS)
เวลาปัจจุบัน: ${currentTime}

ข้อมูลผู้ใช้:
- งานที่ค้าง (To-Dos): ${todos || 'ไม่มี'}
- ตารางเรียน (Schedule): ${schedule || 'ไม่มี'}
${memories || ''}

ภารกิจ: วิเคราะห์ข้อมูลข้างต้นและสร้าง "การแจ้งเตือนเชิงรุก" หรือ "สรุปสิ่งที่ควรทำ" 1-3 ข้อที่สำคัญที่สุด
ข้อความต้องมีความเป็นกันเอง ให้กำลังใจ และเป็นประโยชน์จริงๆ

สำหรับแต่ละข้อความ ให้ระบุ:
1. message: ข้อความสรุปสั้นๆ (เช่น "ใกล้ถึงกำหนดส่งงานวิจัยแล้ว!")
2. details: รายละเอียดเพิ่มเติมหรือคำแนะนำ (เช่น "คุณเหลือเวลาอีก 2 วัน แนะนำให้เริ่มสรุปส่วนที่เหลือในวันนี้เพื่อให้ทันกำหนดส่ง")
3. urgency: ความสำคัญ (high: เร็วๆ นี้/สำคัญมาก, medium: ปกติ, low: แนะนำทั่วไป)
4. type: ประเภท (deadline, class, reminder, insight)

ตอบเป็น JSON เท่านั้น:
{"alerts":[{"type":"...","message":"...","details":"...","urgency":"..."}]}

ถ้าไม่มีอะไรน่าเตือน ให้ส่ง: {"alerts":[]}
ห้ามตอบอะไรนอกจาก JSON เท่านั้น`;

    const res = await fetch(`${THAILLM_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODELS.openthaigpt,
        messages: [
          { role: 'system', content: alertPrompt },
          { role: 'user', content: 'วิเคราะห์ข้อมูลและสรุป JSON มาให้หน่อย' },
        ],
        max_tokens: 1024,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ alerts: [] });
    }

    const data = await res.json();
    let content = data.choices?.[0]?.message?.content || '{"alerts":[]}';
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.alerts && Array.isArray(parsed.alerts)) {
          return NextResponse.json({
            alerts: parsed.alerts.slice(0, 3).map((a: { type?: string; message?: string; details?: string; urgency?: string }) => ({
              type: a.type || 'reminder',
              message: a.message || '',
              details: a.details || '',
              urgency: a.urgency || 'medium',
            })).filter((a: { message: string }) => a.message.length > 0),
          });
        }
      }
    } catch {
      // Parse failed
    }

    return NextResponse.json({ alerts: [] });
  } catch (error) {
    console.error('Proactive alert error:', error);
    return NextResponse.json({ alerts: [] });
  }
}
