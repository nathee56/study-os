import { NextRequest, NextResponse } from 'next/server';
import { THAILLM_BASE, MODELS } from '@/lib/thaillm';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.THAILLM_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Only process last few messages to save tokens
    const recentMessages = messages.slice(-4);

    const extractionPrompt = `จากบทสนทนาต่อไปนี้ ให้สกัดข้อมูลสำคัญเกี่ยวกับผู้ใช้ที่ AI ควรจดจำไว้สำหรับการสนทนาครั้งต่อไป เช่น:
- วิชาที่เรียนอ่อน/เก่ง
- นิสัยการเรียน เวลาที่ชอบทำงาน
- เป้าหมาย ความสนใจ
- ปัญหาที่พบบ่อย
- ข้อมูลส่วนตัวที่เกี่ยวข้องกับการเรียน

ถ้าไม่มีข้อมูลใหม่ที่ควรจำ ให้ตอบ: []

ตอบเป็น JSON array เท่านั้น รูปแบบ:
[{"key": "หมวด", "value": "ข้อมูลที่ควรจำ"}]

ห้ามตอบอย่างอื่นนอกจาก JSON array`;

    const apiMessages = [
      { role: 'system', content: extractionPrompt },
      ...recentMessages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content.slice(0, 500), // Truncate long messages
      })),
      { role: 'user', content: 'สกัดข้อมูลสำคัญจากบทสนทนาข้างต้น ตอบเป็น JSON array เท่านั้น' },
    ];

    const res = await fetch(`${THAILLM_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODELS.openthaigpt,
        messages: apiMessages,
        max_tokens: 512,
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ memories: [] });
    }

    const data = await res.json();
    let content = data.choices?.[0]?.message?.content || '[]';

    // Remove <think>...</think> if present
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // Try to parse JSON from the response
    try {
      // Extract JSON array from response (handle cases where AI adds extra text)
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const memories = JSON.parse(jsonMatch[0]);
        if (Array.isArray(memories)) {
          // Validate and clean
          const cleaned = memories
            .filter((m: { key?: string; value?: string }) => m.key && m.value && m.value.length > 2)
            .slice(0, 5) // Max 5 memories per extraction
            .map((m: { key: string; value: string }) => ({
              key: m.key.slice(0, 50),
              value: m.value.slice(0, 200),
            }));
          return NextResponse.json({ memories: cleaned });
        }
      }
    } catch {
      // JSON parse failed, return empty
    }

    return NextResponse.json({ memories: [] });
  } catch (error) {
    console.error('Memory extraction error:', error);
    return NextResponse.json({ memories: [] });
  }
}
