'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat } from '@/lib/hooks/useChat';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTodos } from '@/lib/hooks/useTodos';
import { useNotes } from '@/lib/hooks/useNotes';
import { useAIMemory } from '@/lib/hooks/useAIMemory';
import { MODELS, MODEL_INFO, ModelKey, buildSystemPrompt, recommendModel } from '@/lib/thaillm';
import {
  IconPlus, IconMessageCircle, IconTrash, IconCpu,
  IconSparkle, IconPaperclip, IconX, IconSend, IconMenu, IconArrowLeft
} from '@/components/ui/Icons';
import { useRouter } from 'next/navigation';

export default function AIPage() {
  const { user } = useAuth();
  const { chats, activeChat, setActiveChat, loading, sending, createChat, sendMessage, deleteChat } = useChat();
  const { todos } = useTodos();
  const { notes } = useNotes();
  const { getMemoryPrompt } = useAIMemory();
  const router = useRouter();

  const [input, setInput] = useState('');
  const [model, setModel] = useState<ModelKey | 'auto'>('auto');
  const [fileContext, setFileContext] = useState<{ name: string; content: string } | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const pendingTodos = todos.filter((t) => !t.done);

  const systemPrompt = useMemo(() => {
    return buildSystemPrompt({
      todos: pendingTodos.map((t) => `${t.title} (${t.subject || '-'}, ส่ง: ${t.dueDate?.toLocaleDateString('th-TH') || '-'})`).join(', '),
      schedule: '',
      notes: notes.slice(0, 5).map((n) => n.title).join(', '),
      memories: getMemoryPrompt(),
    });
  }, [pendingTodos, notes, getMemoryPrompt]);

  // Contextual suggestions based on user data
  const suggestions = useMemo(() => {
    const hour = new Date().getHours();
    const items: string[] = [];
    if (pendingTodos.length > 0) {
      items.push(`สรุปงานที่ค้างอยู่ ${pendingTodos.length} รายการให้หน่อย`);
      const urgent = pendingTodos.find(t => t.priority === 'urgent');
      if (urgent) items.push(`มึง "${urgent.title}" ด่วนมาก ช่วยวางแผนทำให้หน่อย`);
    }
    if (notes.length > 0) items.push(`สรุปโน้ต "${notes[0]?.title}" ให้หน่อย`);
    if (hour < 12) items.push('วางแผนการเรียนวันนี้ให้หน่อย');
    else if (hour < 18) items.push('ช่วยทบทวนเนื้อหาที่เรียนวันนี้');
    else items.push('ช่วยเตรียมตัวสำหรับการเรียนพรุ่งนี้');
    items.push('อธิบายแนวคิด OOP ให้เข้าใจง่ายๆ');
    return items.slice(0, 4);
  }, [pendingTodos, notes]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, sending]);

  const handleSend = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg && !fileContext) return;

    let chatId = activeChat?.id;
    if (!chatId) {
      chatId = await createChat(model === 'auto' ? MODELS['openthaigpt'] : MODELS[model]);
    }
    if (!chatId) return;

    setInput('');
    let finalContent = msg;
    if (fileContext) {
      finalContent = msg
        ? `คำถาม: ${msg}\n\nเนื้อหาจากไฟล์ "${fileContext.name}":\n\n${fileContext.content}`
        : `สรุปเนื้อหาจากไฟล์ "${fileContext.name}":\n\n${fileContext.content}`;
      setFileContext(null);
    }

    const selectedModel = model === 'auto' ? MODELS[recommendModel(msg || 'summarize')] : MODELS[model];
    try {
      await sendMessage(chatId, finalContent, selectedModel, systemPrompt);
    } catch (error) {
      console.error('Send error:', error);
      alert('AI ไม่ตอบสนอง กรุณาลองใหม่อีกครั้ง');
    }
  }, [input, fileContext, activeChat, model, createChat, sendMessage, systemPrompt]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFileContext({ name: file.name, content: ev.target?.result as string });
    reader.readAsText(file);
  };

  const handleNewChat = async () => {
    const selectedModel = model === 'auto' ? MODELS['openthaigpt'] : MODELS[model];
    const id = await createChat(selectedModel);
    if (id) {
      setActiveChat({ id, title: 'แชทใหม่', messages: [], model: selectedModel, createdAt: new Date() });
      setShowSidebar(false);
    }
  };

  const containerStyle: React.CSSProperties = isMobile
    ? { display: 'flex', flexDirection: 'column', height: '100dvh', position: 'fixed', inset: 0, zIndex: 30, background: 'var(--surface-base)', overflow: 'hidden', overscrollBehavior: 'none' }
    : { display: 'flex', height: 'calc(100dvh - var(--topbar-height) - 32px - var(--mobile-bottom-space, 0px))', position: 'relative', overflow: 'hidden', maxWidth: '100%', boxSizing: 'border-box' };

  return (
    <div style={containerStyle}>
      {/* Sidebar Overlay (Mobile) */}
      {showSidebar && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowSidebar(false)}>
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: 300,
            background: 'var(--surface-card)', borderRight: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', animation: 'slideRight 0.3s ease'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700 }}>ประวัติการแชท</h3>
              <button onClick={handleNewChat} className="btn-icon"><IconPlus size={18} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              {chats.map(chat => (
                <button key={chat.id} onClick={() => { setActiveChat(chat); setShowSidebar(false); }}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12, textAlign: 'left',
                    background: activeChat?.id === chat.id ? 'var(--accent-soft)' : 'transparent',
                    color: activeChat?.id === chat.id ? 'var(--accent)' : 'var(--text-secondary)',
                    marginBottom: 4, border: 'none', cursor: 'pointer', fontSize: 14
                  }}>
                  {chat.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FIXED TOP BAR (Mobile Only) */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '12px 16px' : '8px 16px',
        paddingTop: isMobile ? 'max(env(safe-area-inset-top, 12px), 12px)' : '8px',
        flexShrink: 0,
        borderBottom: isMobile ? '1px solid var(--border)' : 'none',
        background: 'var(--surface-base)',
        zIndex: 10,
        touchAction: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isMobile && (
            <button onClick={() => router.back()}
              style={{
                background: 'var(--surface-card)', border: '1px solid var(--border)',
                borderRadius: 10, width: 38, height: 38,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-primary)',
              }}>
              <IconArrowLeft size={18} />
            </button>
          )}
          <button onClick={() => setShowSidebar(true)}
            style={{
              background: 'var(--surface-card)', border: '1px solid var(--border)',
              borderRadius: 10, width: 38, height: 38,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-secondary)',
            }}>
            <IconMenu size={18} />
          </button>
        </div>
        {isMobile && <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>AI Assistant</span>}
        <button onClick={handleNewChat}
          style={{
            background: 'var(--surface-card)', border: '1px solid var(--border)',
            borderRadius: 10, width: 38, height: 38,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-secondary)',
          }}>
          <IconPlus size={18} />
        </button>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', minHeight: 0, overscrollBehaviorY: 'contain' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px', boxSizing: 'border-box', width: '100%' }}>
          {!activeChat || activeChat.messages.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '40px 0' }}>
              <img src="/ai-logo.png" alt="JamDai AI" style={{ width: 72, height: 72, borderRadius: 20, marginBottom: 24, objectFit: 'cover' }} />
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>วันนี้ให้ช่วยอะไรดี?</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28, maxWidth: 360 }}>JamDai AI พร้อมช่วยเรื่องการเรียน สรุปเนื้อหา และอีกมากมาย</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: 10, width: '100%', maxWidth: 480 }}>
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => handleSend(s)}
                    style={{
                      background: 'var(--surface-card)', border: '1px solid var(--border)',
                      borderRadius: 14, padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', lineHeight: 1.4
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '20px 0 40px' }}>
              {activeChat.messages.map((msg, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
                    background: msg.role === 'user' ? 'var(--surface-raised)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2
                  }}>
                    {msg.role === 'user' ? (
                      user?.photoURL ? <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{user?.displayName?.charAt(0) || 'U'}</span>
                    ) : (
                      <img src="/ai-logo.png" alt="AI" style={{ width: 32, height: 32, borderRadius: 10, objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: msg.role === 'user' ? 'var(--text-primary)' : 'var(--accent)' }}>
                      {msg.role === 'user' ? (user?.displayName || 'คุณ') : 'JamDai AI'}
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)' }}>
                      {msg.role === 'assistant' ? (
                        <div className="markdown-body"><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown></div>
                      ) : msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {sending && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <img src="/ai-logo.png" alt="AI" style={{ width: 32, height: 32, borderRadius: 10 }} />
                  <div style={{ paddingTop: 8 }}>
                    <div className="typing-indicator"><span></span><span></span><span></span></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* FIXED INPUT AREA */}
      <div style={{
        flexShrink: 0,
        padding: isMobile ? '8px 16px max(env(safe-area-inset-bottom, 12px), 12px)' : '8px 16px 20px',
        maxWidth: 720, width: '100%', margin: '0 auto', boxSizing: 'border-box',
        background: 'var(--surface-base)',
        borderTop: '1px solid var(--border)',
        zIndex: 10,
        touchAction: 'none'
      }}>
        {fileContext && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--surface-raised)', borderRadius: 10, fontSize: 12, marginBottom: 8, color: 'var(--text-secondary)' }}>
            <IconPaperclip size={14} style={{ color: 'var(--accent)' }} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileContext.name}</span>
            <button onClick={() => setFileContext(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><IconX size={14} /></button>
          </div>
        )}
        <form onSubmit={e => { e.preventDefault(); handleSend(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface-card)', border: '1px solid var(--border)',
            borderRadius: 24, padding: '6px 8px 6px 6px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          }}>
          <button type="button" onClick={() => fileInputRef.current?.click()}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
            <IconPaperclip size={18} />
          </button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".txt,.md,.js,.ts,.tsx,.html,.css,.json" onChange={handleFileUpload} />
          <input
            placeholder="พิมพ์ข้อความ..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={sending}
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: 'var(--text-primary)', height: 36, padding: '0 4px', fontFamily: 'inherit' }}
          />
          <button type="submit" disabled={sending || (!input.trim() && !fileContext)}
            style={{
              width: 36, height: 36, borderRadius: '50%', border: 'none', flexShrink: 0,
              background: (sending || (!input.trim() && !fileContext)) ? 'var(--surface-raised)' : 'var(--accent)',
              color: (sending || (!input.trim() && !fileContext)) ? 'var(--text-muted)' : 'white',
              cursor: (sending || (!input.trim() && !fileContext)) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
            }}>
            <IconSend size={16} />
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
          JamDai AI อาจให้ข้อมูลที่ไม่ถูกต้อง กรุณาตรวจสอบข้อมูลสำคัญ
        </p>
      </div>
    </div>
  );
}
