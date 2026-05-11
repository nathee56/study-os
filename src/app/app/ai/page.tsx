'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat, ChatMessage } from '@/lib/hooks/useChat';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTodos } from '@/lib/hooks/useTodos';
import { useNotes } from '@/lib/hooks/useNotes';
import { useAIMemory } from '@/lib/hooks/useAIMemory';
import { MODELS, MODEL_INFO, ModelKey, buildSystemPrompt, recommendModel } from '@/lib/thaillm';
import { 
  IconPlus, IconMessageCircle, IconTrash, IconCpu, IconChevronDown, 
  IconSparkle, IconClock, IconPaperclip, IconUser, IconX,
  IconCheckSquare, IconCalendar, IconFileText
} from '@/components/ui/Icons';

export default function AIPage() {
  const { user } = useAuth();
  const { chats, activeChat, setActiveChat, loading, sending, createChat, sendMessage, deleteChat } = useChat();
  const { todos } = useTodos();
  const { notes } = useNotes();
  const { memories, getMemoryPrompt, deleteMemory } = useAIMemory();

  const [input, setInput] = useState('');
  const [model, setModel] = useState<ModelKey | 'auto'>('auto');
  const [showModels, setShowModels] = useState(false);
  const [fileContext, setFileContext] = useState<{ name: string; content: string } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const pendingTodos = todos.filter((t) => !t.done);
  
  const systemPrompt = useMemo(() => {
    const basePrompt = buildSystemPrompt({
      todos: pendingTodos.map((t) => `${t.title} (${t.subject || 'ไม่ระบุวิชา'}, ส่ง: ${t.dueDate?.toLocaleDateString('th-TH') || '-'})`).join(', '),
      schedule: '',
      notes: notes.slice(0, 5).map((n) => `${n.title}`).join(', '),
      memories: getMemoryPrompt(),
    });
    
    return `${basePrompt}\n\nตอนท้ายสุดของคำตอบของคุณ ให้แนะนำคำถามถัดไปที่น่าสนใจ 3 ข้อเพื่อถามต่อ โดยคั่นด้วยเครื่องหมาย | และวางไว้บรรทัดสุดท้าย (ตัวอย่าง: แนะนำ: ข้อต่อไปคืออะไร | ขอรายละเอียดเพิ่ม | ยกตัวอย่าง)`;
  }, [pendingTodos, notes, getMemoryPrompt]);

  const suggestions = useMemo(() => {
    const items = [];
    if (pendingTodos.length > 0) items.push(`งานอะไรส่งเร็วที่สุด?`);
    if (notes.length > 0) items.push(`สรุปโน้ต ${notes[0]?.title} ให้หน่อย`);
    items.push('ช่วยสรุปเนื้อหาบทเรียนให้หน่อย');
    return items.slice(0, 4);
  }, [pendingTodos, notes]);

  const [showMobileHistory, setShowMobileHistory] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, sending]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('fromFile') === 'true') {
      const contextStr = sessionStorage.getItem('ai_file_context');
      if (contextStr) {
        const { name, content } = JSON.parse(contextStr);
        setFileContext({ name, content });
      }
    }

    // Check for initial query from Dashboard banner
    const initialQuery = sessionStorage.getItem('ai_initial_query');
    if (initialQuery) {
      sessionStorage.removeItem('ai_initial_query');
      handleSend(initialQuery);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContext({ name: file.name, content: event.target?.result as string });
    };
    reader.readAsText(file);
  };

  const handleSend = async (text?: string) => {
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
        ? `คำสั่ง/คำถาม: ${msg}\n\nเนื้อหาจากไฟล์ "${fileContext.name}":\n\n${fileContext.content}`
        : `กรุณาสรุปเนื้อหาจากไฟล์ "${fileContext.name}" นี้ให้หน่อย:\n\n${fileContext.content}`;
      setFileContext(null);
    }

    const selectedModel = model === 'auto' ? MODELS[recommendModel(msg || 'summarize')] : MODELS[model];
    try {
      await sendMessage(chatId, finalContent, selectedModel, systemPrompt);
    } catch (err) {
      console.error(err);
      alert('AI ไม่ตอบสนอง โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือ API Key ในระบบ');
    }
  };

  const handleNewChat = async () => {
    const selectedModel = model === 'auto' ? MODELS['openthaigpt'] : MODELS[model];
    const id = await createChat(selectedModel);
    if (id) {
      setActiveChat({ id, title: 'แชทใหม่', messages: [], model: selectedModel, createdAt: new Date() });
      setShowMobileHistory(false);
    }
  };

  return (
    <div className="ai-chat-viewport animate-fade-in" style={{ display: 'flex', gap: 16 }}>
      {/* Chat History - Desktop */}
      <div className="card" style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        id="chat-history-panel">
        <button className="btn-primary" onClick={handleNewChat} style={{ marginBottom: 12, width: '100%', fontSize: 13 }}>
          <IconPlus size={14} /> แชทใหม่
        </button>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.map((chat) => (
            <div key={chat.id} style={{ display: 'flex', width: '100%', margin: '2px 0', position: 'relative' }} className="nav-item-wrapper">
              <button
                className={`nav-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                onClick={() => setActiveChat(chat)}
                style={{ flex: 1, padding: '8px 10px', textAlign: 'left', minWidth: 0 }}>
                <IconMessageCircle size={14} />
                <div style={{ flex: 1, minWidth: 0, paddingRight: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {chat.title}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-hint)' }}>
                    {chat.createdAt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </button>
              <button 
                className="btn-icon" 
                style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', opacity: activeChat?.id === chat.id ? 1 : 0.4, padding: 4 }}
                onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                title="ลบแชท"
              >
                <IconTrash size={14} style={{ color: 'var(--danger)' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat */}
      <div className="ai-chat-viewport-inner">
        {/* Chat Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-icon mobile-only" onClick={() => setShowMobileHistory(true)} 
              style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <IconMessageCircle size={20} />
            </button>
            <div style={{ position: 'relative' }}>
              <button className="btn-ghost" onClick={() => setShowModels(!showModels)} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 12 }}>
                <IconCpu size={14} /> {model === 'auto' ? 'Auto (AI แนะนำ)' : MODEL_INFO[model].name}
                <IconChevronDown size={14} style={{ transform: showModels ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {showModels && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 19 }} onClick={() => setShowModels(false)} />
                  <div className="card" style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, padding: 4, zIndex: 20, minWidth: 280 }}>
                    <button className={`nav-item ${model === 'auto' ? 'active' : ''}`}
                      onClick={() => { setModel('auto'); setShowModels(false); }}
                      style={{ width: '100%', margin: '2px 0', padding: '8px 12px' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--orange)' }}>Auto (AI แนะนำ)</div>
                        <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>ให้ระบบเลือกโมเดลที่เหมาะกับคำถามให้อัตโนมัติ</div>
                      </div>
                    </button>
                    {(Object.keys(MODELS) as ModelKey[]).map((key) => (
                      <button key={key} className={`nav-item ${model === key ? 'active' : ''}`}
                        onClick={() => { setModel(key); setShowModels(false); }}
                        style={{ width: '100%', margin: '2px 0', padding: '8px 12px' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{MODEL_INFO[key].name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>{MODEL_INFO[key].description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'right' }} className="desktop-only">
                <div style={{ fontSize: 12, fontWeight: 600 }}>{user.displayName}</div>
                <div style={{ fontSize: 10, color: 'var(--text-hint)' }}>ผู้ใช้งานระบบ</div>
              </div>
              <div style={{ 
                width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', 
                border: '2px solid var(--border-strong)', background: 'var(--surface-raised)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <IconUser size={18} style={{ color: 'var(--accent)' }} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="ai-chat-messages">
          {!activeChat || activeChat.messages.length === 0 ? (
            <div className="ai-empty-state">
              <div className="ai-empty-icon">
                <IconSparkle size={32} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>JamDai AI พร้อมช่วยคุณ</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 300, marginTop: -4 }}>ถามเกี่ยวกับงานที่ค้างอยู่ หรือให้ช่วยสรุปเนื้อหาบทเรียนได้ทันที</p>
              <div className="ai-suggestions">
                {suggestions.map((s, i) => (
                  <button key={i} className="chip" onClick={() => handleSend(s)}>{s}</button>
                ))}
              </div>
            </div>
          ) : (
            activeChat.messages.map((msg, i) => {
              let content = msg.content;
              let choices: string[] = [];
              if (msg.role === 'assistant' && content.includes('|')) {
                const lines = content.split('\n');
                const lastLine = lines[lines.length - 1];
                if (lastLine.includes('|')) {
                  choices = lastLine.replace(/^แนะนำ:\s*/, '').split('|').map(s => s.trim()).filter(s => s);
                  content = lines.slice(0, -1).join('\n');
                }
              }

              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', padding: '0 4px' }}>
                  <div className={msg.role === 'user' ? 'chat-bubble chat-bubble-user' : 'chat-bubble chat-bubble-ai'} 
                    style={{ maxWidth: msg.role === 'user' ? '85%' : '95%', fontSize: 14 }}>
                    {msg.role === 'assistant' ? (
                      <div className="markdown-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {content}
                        </ReactMarkdown>
                      </div>
                    ) : content}
                  </div>
                  {choices.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, marginLeft: msg.role === 'user' ? 0 : 8, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      {choices.map((c, idx) => (
                        <button key={idx} className="chip" onClick={() => handleSend(c)} 
                          style={{ fontSize: 11, padding: '6px 12px', background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
          {sending && (
            <div className="chat-bubble chat-bubble-ai" style={{ width: 'fit-content', marginLeft: 4 }}>
              <div className="typing-indicator">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area — STICKY at bottom */}
        <div className="ai-chat-input-area">
          {fileContext && (
            <div className="ai-file-badge">
              <IconPaperclip size={14} style={{ color: 'var(--accent)' }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                กำลังใช้ข้อมูลจาก: <strong>{fileContext.name}</strong>
              </span>
              <button className="btn-icon" onClick={() => setFileContext(null)} style={{ padding: 2, width: 28, height: 28 }}>
                <IconX size={14} />
              </button>
            </div>
          )}
          <div className="ai-chat-input-row">
            <button 
              className="btn-icon" 
              onClick={() => fileInputRef.current?.click()}
              style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--surface-card)', border: '1px solid var(--border)' }}
              title="แนบไฟล์ข้อความ"
            >
              <IconPaperclip size={20} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".txt,.md,.js,.ts,.tsx,.html,.css,.json"
              onChange={handleFileUpload} 
            />
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                className="input"
                style={{ 
                  height: 44, borderRadius: 14, 
                  paddingRight: 50, 
                  borderTopLeftRadius: fileContext ? 0 : 14,
                  borderTopRightRadius: fileContext ? 0 : 14,
                }}
                placeholder={fileContext ? "ถาม AI เกี่ยวกับไฟล์นี้..." : "พิมพ์คำถามของคุณที่นี่..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                className="btn-primary"
                style={{ position: 'absolute', right: 4, top: 4, bottom: 4, width: 36, borderRadius: 10, padding: 0 }}
                onClick={() => handleSend()}
                disabled={sending}
              >
                {sending ? '...' : '→'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Context Panel - Desktop */}
      <div className="card" style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'auto', fontSize: 12 }}
        id="context-panel">
        <h4 style={{ fontSize: 13, marginBottom: 12 }}>บริบทปัจจุบัน</h4>

        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <IconCheckSquare size={14} style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 600 }}>งานค้าง ({pendingTodos.length})</span>
          </div>
          {pendingTodos.slice(0, 3).map((t) => (
            <div key={t.id} style={{ padding: '3px 0', color: 'var(--text-secondary)', fontSize: 11 }}>
              {t.title}
            </div>
          ))}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <IconFileText size={14} style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 600 }}>โน้ตล่าสุด</span>
          </div>
          {notes.slice(0, 3).map((n) => (
            <div key={n.id} style={{ padding: '3px 0', color: 'var(--text-secondary)', fontSize: 11 }}>
              {n.title}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile History Drawer */}
      {showMobileHistory && (
        <div className="modal-overlay open" onClick={() => setShowMobileHistory(false)} style={{ zIndex: 1000 }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ 
            position: 'absolute', bottom: 0, left: 0, right: 0, 
            maxWidth: 'none', borderRadius: '24px 24px 0 0', height: '70vh',
            padding: 20, display: 'flex', flexDirection: 'column'
          }}>
            <div className="modal-header">
              <h3>ประวัติการแชท</h3>
              <button className="btn-icon" onClick={() => setShowMobileHistory(false)}><IconX size={20} /></button>
            </div>
            <button className="btn-primary" onClick={handleNewChat} style={{ marginBottom: 16, width: '100%' }}>
              <IconPlus size={16} /> เริ่มแชทใหม่
            </button>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {chats.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-hint)' }}>ไม่มีประวัติการแชท</div>}
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  className={`nav-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                  onClick={() => { setActiveChat(chat); setShowMobileHistory(false); }}
                  style={{ width: '100%', padding: '12px', margin: '4px 0', textAlign: 'left', borderRadius: 12 }}>
                  <IconMessageCircle size={16} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{chat.title}</div>
                    <div style={{ fontSize: 11, opacity: 0.6 }}>{chat.createdAt.toLocaleDateString('th-TH')}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          #chat-history-panel, #context-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
