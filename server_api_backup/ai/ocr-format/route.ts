import { NextRequest, NextResponse } from 'next/server';
import { THAILLM_BASE, MODELS } from '@/lib/thaillm';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const apiKey = process.env.THAILLM_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ThaiLLM API key not configured' },
        { status: 500 }
      );
    }

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    const systemPrompt = `คุณคือผู้ช่วยสรุปโน้ตอัจฉริยะ หน้าที่ของคุณคือรับข้อความดิบ (Raw Text) ที่ได้จากการสแกนรูปภาพ (OCR) และจัดรูปแบบใหม่ให้เป็นโน้ตที่สวยงาม อ่านง่าย และเป็นระเบียบ

กฎการจัดรูปแบบ:
1. ตั้งชื่อหัวข้อที่เหมาะสมและน่าสนใจ
2. ใช้โครงสร้างหัวข้อ (Heading), รายการ (Bullet points), หรือลำดับตัวเลข
3. เน้นจุดสำคัญ (Bold)
4. ตัดคำที่อ่านผิดหรือขยะจากการ OCR ออกให้เหมาะสม
5. ใช้ภาษาไทยที่ถูกต้องและสละสลวย
6. ผลลัพธ์ต้องอยู่ในรูปแบบ JSON ดังนี้:
{
  "title": "หัวข้อโน้ต",
  "body": "เนื้อหาโน้ตในรูปแบบ HTML หรือ Text ที่จัดรูปแบบแล้ว",
  "subject": "วิชาหรือหมวดหมู่ที่เหมาะสม (สั้นๆ)"
}`;

    const res = await fetch(`${THAILLM_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODELS.typhoon, // ใช้ Typhoon สำหรับการสรุปและจัดรูปแบบ
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `นี่คือข้อความดิบจากการ OCR:\n\n${text}` }
        ],
        max_tokens: 2048,
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `ThaiLLM API error: ${res.status}`, details: errorText },
        { status: res.status }
      );
    }

    const data = await res.json();
    let content = data.choices?.[0]?.message?.content || '{}';
    
    // Remove <think>...</think> content if present
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    try {
      const formattedNote = JSON.parse(content);
      return NextResponse.json(formattedNote);
    } catch (e) {
      // Fallback if AI doesn't return valid JSON
      return NextResponse.json({
        title: "โน้ตจากการสแกน",
        body: content,
        subject: "สแกน"
      });
    }
  } catch (error) {
    console.error('AI OCR Format error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
