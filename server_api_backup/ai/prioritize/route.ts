import { NextRequest, NextResponse } from 'next/server';
import { THAILLM_BASE, MODELS } from '@/lib/thaillm';

export async function POST(req: Request) {
  try {
    const { todos } = await req.json();
    const apiKey = process.env.THAILLM_API_KEY;

    if (!apiKey || !todos || todos.length === 0) {
      return NextResponse.json({ priorities: [] });
    }

    const now = new Date();
    const currentTime = now.toLocaleString('th-TH', { 
      timeZone: 'Asia/Bangkok',
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    const todoList = todos.map((t: any) => 
      `- [${t.id}] งาน: "${t.title}" | วิชา: ${t.subject || 'ทั่วไป'} | กำหนดส่ง: ${t.dueDate || 'ไม่มี'} | ความยาก: ${t.difficulty || 3}/5 | ความเร่งด่วนเดิม: ${t.priority === 'urgent' ? 'สูง' : 'ปกติ'}`
    ).join('\n');

    const prompt = `คุณคือ "โค้ชจดจำ" AI ผู้เชี่ยวชาญด้าน Productivity ระดับโลก
เวลาปัจจุบันในประเทศไทย: ${currentTime}

ข้อมูลรายการงานของผู้ใช้:
${todoList}

ภารกิจ: วิเคราะห์และจัดลำดับความสำคัญ (Prioritization) ให้ "ใช้งานได้จริง"
เกณฑ์การวิเคราะห์:
1. Eisenhower Matrix: งานที่ใกล้ส่ง (Deadline) และด่วน ต้องทำทันที (Score 90-100)
2. Eat the Frog: งานที่ "ยาก" (difficulty 4-5) ควรแนะนำให้ทำเป็นอย่างแรกของวันถ้าไม่มีงานด่วนมาก
3. ความต่อเนื่อง: งานวิชาเดียวกันควรจัดกลุ่มให้ทำต่อเนื่องกัน
4. พลังงาน: ประเมินว่างานไหนใช้พลังงานเยอะหรืองานไหนเป็นงานแผ้วถาง (Quick Wins)

ให้คะแนน score (1-100) และเขียน "เหตุผลที่ทำให้ผู้ใช้อยากเริ่มทำทันที" (เป็นภาษาไทยที่เป็นกันเองแต่ทรงพลัง)

ตอบเป็น JSON เท่านั้น (Strictly JSON):
{
  "priorities": [
    { 
      "todoId": "ID", 
      "score": 95, 
      "reason": "วิชานี้ใกล้ส่งพรุ่งนี้แล้ว แถมระดับความยากสูง รีบจัดการตอนนี้ก่อนที่พลังงานจะหมดจะดีที่สุดครับ!" 
    }
  ]
}
ห้ามมีคำพูดอื่นนอกเหนือจาก JSON ห้ามใส่ Markdown Code Block`;

    const res = await fetch(`${THAILLM_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODELS.pathumma, // ใช้โมเดลที่คิดวิเคราะห์เก่งที่สุด
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'ช่วยจัดลำดับความสำคัญให้ "ใช้งานได้จริง" และทรงพลังที่สุดหน่อย' }
        ],
        temperature: 0.3, // เพิ่มความนิ่งของคำตอบ
        max_tokens: 1500
      })
    });

    const data = await res.json();
    let content = data.choices?.[0]?.message?.content || '{}';
    
    // Clean content from thinking tags or markdown blocks
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '');
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(content);
      if (parsed.priorities && Array.isArray(parsed.priorities)) {
        return NextResponse.json(parsed);
      }
    } catch (e) {
      // If parsing fails, try to find JSON object in string
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return NextResponse.json(JSON.parse(jsonMatch[0]));
      }
    }

    return NextResponse.json({ priorities: [] });
  } catch (error) {
    console.error('Prioritize Error:', error);
    return NextResponse.json({ priorities: [] }, { status: 500 });
  }
}
