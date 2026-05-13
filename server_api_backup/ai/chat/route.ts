import { NextRequest, NextResponse } from 'next/server';
import { THAILLM_BASE, MODELS } from '@/lib/thaillm';

export async function POST(req: NextRequest) {
  try {
    const { messages, model = MODELS.openthaigpt } = await req.json();
    const apiKey = process.env.THAILLM_API_KEY;

    console.log('Calling AI API:', THAILLM_BASE, 'Model:', model, 'Key exists:', !!apiKey);

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ThaiLLM API key not configured' },
        { status: 500 }
      );
    }

    const res = await fetch(`${THAILLM_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 2048,
        temperature: 0.3,
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
    let content = data.choices?.[0]?.message?.content || 'ไม่สามารถสร้างคำตอบได้';

    // Remove <think>...</think> content if present
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    console.log('AI Response Success:', content.slice(0, 50) + '...');
    return NextResponse.json({ content });
  } catch (error) {
    console.error('AI Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
