import { NextRequest, NextResponse } from 'next/server';
import { THAILLM_BASE, MODELS } from '@/lib/thaillm';

export async function POST(req: NextRequest) {
  try {
    const { todos, schedule, memories, currentTime } = await req.json();
    const apiKey = process.env.THAILLM_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ alerts: [] });
    }

    const alertPrompt = `คุณคือระบบแจ้งเตือนอัจฉริยะของ JamDai
เวลาปัจจุบัน: ${currentTime}

ข้อมูลผู้ใช้:
- งานที่ค้าง: ${todos || 'ไม่มี'}
- ตารางเรียน: ${schedule || 'ไม่มี'}
${memories || ''}

จากข้อมูลข้างต้น สร้างข้อความแจ้งเตือนสั้นๆ 1-2 ข้อที่เป็นประโยชน์กับผู้ใช้ เช่น:
- งานที่ใกล้ deadline
- คาบเรียนที่จะมาถึงใน 30 นาที - 1 วัน
- งานที่ยังไม่ได้ทำ

ตอบเป็น JSON เท่านั้น:
{"alerts":[{"type":"deadline|class|reminder","message":"ข้อความ","urgency":"high|medium|low"}]}

ถ้าไม่มีอะไรน่าเตือน: {"alerts":[]}
ห้ามตอบอะไรนอกจาก JSON`;

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
          { role: 'user', content: 'สร้างข้อความแจ้งเตือนจากข้อมูลข้างต้น ตอบ JSON เท่านั้น' },
        ],
        max_tokens: 512,
        temperature: 0.2,
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
            alerts: parsed.alerts.slice(0, 3).map((a: { type?: string; message?: string; urgency?: string }) => ({
              type: a.type || 'reminder',
              message: a.message || '',
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
