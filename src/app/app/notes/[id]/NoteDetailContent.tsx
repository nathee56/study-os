'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useNotes } from '@/lib/hooks/useNotes';
import { useRouter } from 'next/navigation';
import { IconX, IconSparkle, IconSend, IconTrash } from '@/components/ui/Icons';
import dynamic from 'next/dynamic';

const NoteEditor = dynamic(() => import('@/components/notes/NoteEditor'), { ssr: false });

export default function NoteDetailContent({ id }: { id: string }) {
  const { notes, updateNote, autoSave, deleteNote } = useNotes();
  const router = useRouter();
  const note = notes.find((n) => n.id === id);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [aiChat, setAiChat] = useState<{ role: string; content: string }[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (note && !loaded) {
      setTitle(note.title);
      setSubject(note.subject);
      setBody(note.body);
      setLoaded(true);
    }
  }, [note, loaded]);

  const handleTitleChange = useCallback((val: string) => {
    setTitle(val);
    autoSave(id, { title: val });
  }, [id, autoSave]);

  const handleBodyChange = useCallback((val: string) => {
    setBody(val);
    autoSave(id, { body: val });
  }, [id, autoSave]);

  const handleSubjectChange = useCallback((val: string) => {
    setSubject(val);
    updateNote(id, { subject: val });
  }, [id, updateNote]);

  const handleAiAction = async (action: string) => {
    setAiLoading(true);
    const plainText = body.replace(/<[^>]*>/g, '').trim();
    const prompt = action === 'summarize' ? `สรุปโน้ตนี้ให้กระชับ:\n${plainText}`
      : action === 'explain' ? `อธิบายเนื้อหาในโน้ตนี้เพิ่มเติม:\n${plainText}`
      : action === 'question' ? `ตั้งคำถามจากเนื้อหาโน้ตนี้ 5 ข้อ:\n${plainText}`
      : `แปลโน้ตนี้เป็นภาษาอังกฤษ:\n${plainText}`;
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      setAiChat([...aiChat, { role: 'user', content: action }, { role: 'assistant', content: data.content || 'ไม่สามารถตอบได้' }]);
    } catch { setAiChat([...aiChat, { role: 'assistant', content: 'เกิดข้อผิดพลาด' }]); }
    setAiLoading(false);
  };

  const handleAiSend = async () => {
    if (!aiInput.trim()) return;
    const plainText = body.replace(/<[^>]*>/g, '').trim();
    const msgs = [...aiChat, { role: 'user', content: aiInput }];
    setAiChat(msgs);
    setAiInput('');
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `บริบทโน้ต: ${title}\n${plainText}` },
            ...msgs.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      });
      const data = await res.json();
      setAiChat([...msgs, { role: 'assistant', content: data.content || 'ไม่สามารถตอบได้' }]);
    } catch { setAiChat([...msgs, { role: 'assistant', content: 'เกิดข้อผิดพลาด' }]); }
    setAiLoading(false);
  };

  const handleDelete = async () => {
    if (confirm('ต้องการลบโน้ตนี้?')) { await deleteNote(id); router.push('/app/notes'); }
  };

  if (!note && !loaded) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: 16, height: 'calc(100vh - 120px)' }}>
      {/* Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
          <button className="btn-ghost" onClick={() => router.push('/app/notes')} style={{ padding: '8px 12px', fontSize: 13 }}>
            <IconX size={14} /> กลับ
          </button>
          <input className="input" placeholder="วิชา" value={subject} onChange={(e) => handleSubjectChange(e.target.value)} style={{ width: 140 }} />
          <button className="btn-ghost" onClick={handleDelete} style={{ marginLeft: 'auto', padding: '8px 12px', fontSize: 13, color: 'var(--danger)' }}>
            <IconTrash size={14} />
          </button>
        </div>
        <input value={title} onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="ชื่อโน้ต"
          style={{ fontSize: 24, fontWeight: 700, border: 'none', background: 'none', outline: 'none', color: 'var(--text-primary)', marginBottom: 12, width: '100%' }} />
        <div className="card" style={{ flex: 1, padding: 0, overflow: 'auto' }}>
          <NoteEditor content={body} onChange={handleBodyChange} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 6 }}>
          บันทึกอัตโนมัติ - {note?.updatedAt.toLocaleString('th-TH')}
        </div>
      </div>

      {/* AI Panel - Desktop */}
      <div className="card" style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        id="note-ai-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <IconSparkle size={16} style={{ color: 'var(--orange)' }} />
          <h4 style={{ fontSize: 14 }}>AI Assistant</h4>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {[
            { key: 'summarize', label: 'สรุป' }, { key: 'explain', label: 'อธิบาย' },
            { key: 'question', label: 'ตั้งคำถาม' }, { key: 'translate', label: 'แปล' },
          ].map((a) => (
            <button key={a.key} className="chip" onClick={() => handleAiAction(a.key)}
              style={{ fontSize: 12 }}>{a.label}</button>
          ))}
        </div>

        {/* Chat */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {aiChat.map((msg, i) => (
            <div key={i} className={msg.role === 'user' ? 'chat-bubble chat-bubble-user' : 'chat-bubble chat-bubble-ai'}
              style={{ fontSize: 12, padding: '8px 12px', maxWidth: '90%' }}>
              {msg.content}
            </div>
          ))}
          {aiLoading && <div className="chat-bubble chat-bubble-ai skeleton" style={{ height: 40, width: 120 }} />}
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: 6 }}>
          <input className="input" placeholder="ถามเกี่ยวกับโน้ตนี้..." value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAiSend(); }}
            style={{ flex: 1, fontSize: 12 }} />
          <button className="btn-primary" onClick={handleAiSend} style={{ padding: '8px 10px' }}>
            <IconSend size={14} />
          </button>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) { #note-ai-panel { display: none !important; } }
      `}</style>
    </div>
  );
}
