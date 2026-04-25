export const THAILLM_BASE = 'http://thaillm.or.th/api/v1';

export const MODELS = {
  openthaigpt: 'openthaigpt-thaillm-8b-instruct-v7.2',
  pathumma: 'pathumma-thaillm-qwen3-8b-think-3.0.0',
  typhoon: 'typhoon-s-thaillm-8b-instruct',
  thalle: 'thalle-0.2-thaillm-8b-fa',
} as const;

export type ModelKey = keyof typeof MODELS;
export type ModelId = (typeof MODELS)[ModelKey];

export const MODEL_INFO: Record<ModelKey, { name: string; description: string }> = {
  openthaigpt: {
    name: 'OpenThaiGPT',
    description: 'แนะนำสำหรับ: ตอบทั่วไป, ภาษาไทย',
  },
  pathumma: {
    name: 'Pathumma (Qwen3)',
    description: 'แนะนำสำหรับ: คิดซับซ้อน, วิเคราะห์',
  },
  typhoon: {
    name: 'Typhoon',
    description: 'แนะนำสำหรับ: เขียน, สรุป',
  },
  thalle: {
    name: 'Thalle',
    description: 'แนะนำสำหรับ: วิชาการ, ภาษาอังกฤษ',
  },
};

export function recommendModel(query: string): ModelKey {
  if (
    query.includes('วิเคราะห์') ||
    query.includes('เปรียบเทียบ') ||
    query.includes('ทำไม')
  ) {
    return 'pathumma';
  }
  if (
    query.includes('เขียน') ||
    query.includes('สรุป') ||
    query.includes('outline')
  ) {
    return 'typhoon';
  }
  if (query.includes('english') || query.includes('ภาษาอังกฤษ')) {
    return 'thalle';
  }
  return 'openthaigpt';
}

export function buildSystemPrompt(context: {
  todos?: string;
  schedule?: string;
  notes?: string;
}): string {
  return `คุณคือผู้ช่วย AI ส่วนตัวของนักศึกษา ชื่อ "Study AI"
คุณมีข้อมูลต่อไปนี้ของผู้ใช้:
- To-Do list: ${context.todos || 'ไม่มีข้อมูล'}
- ตารางเรียน: ${context.schedule || 'ไม่มีข้อมูล'}
- โน้ต: ${context.notes || 'ไม่มีข้อมูล'}

กฎการตอบ:
1. ตอบตรงประเด็น กระชับ ไม่เยิ่นเย้อ
2. ใช้ภาษาไทยสละสลวย เป็นกันเอง
3. ไม่แสดง process คิด (thinking/reasoning) ในคำตอบ
4. วรรคตอนถูกต้อง ช่องไฟสวยงาม
5. ถ้าไม่รู้ให้บอกตรงๆ ไม่เดา
6. ตอบคำถามทั่วไปได้แม้ไม่เกี่ยวกับโน้ต`;
}
export async function callLLM(model: string, messages: { role: string; content: string }[]) {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model }),
  });
  if (!res.ok) throw new Error('AI API failed');
  const data = await res.json();
  return { choices: [{ message: { content: data.content } }] };
}
