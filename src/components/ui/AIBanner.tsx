'use client';

import { useState, useMemo } from 'react';
import { IconSparkle, IconSend, IconSearch, IconChevronDown, IconClock, IconCheckSquare, IconCalendar } from './Icons';
import { AIAlert } from '@/lib/hooks/useAIAlert';
import { Todo } from '@/lib/hooks/useTodos';
import { ScheduleItem } from '@/lib/hooks/useSchedule';
import { buildSystemPrompt } from '@/lib/thaillm';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BannerMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIBannerProps {
  pendingCount: number;
  todos: Todo[];
  todayClasses: ScheduleItem[];
  notes: { id: string; title: string }[];
  memories: string;
  alerts: AIAlert[];
  loading: boolean;
  onDismiss: (index: number) => void;
}

const DAY_LABELS: Record<string, string> = {
  mon: 'จันทร์', tue: 'อังคาร', wed: 'พุธ', thu: 'พฤหัสบดี',
  fri: 'ศุกร์', sat: 'เสาร์', sun: 'อาทิตย์',
};

export default function AIBanner({ pendingCount, todos, todayClasses, notes, memories, alerts, loading, onDismiss }: AIBannerProps) {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatMessages, setChatMessages] = useState<BannerMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Build context-aware system prompt for banner AI
  const bannerSystemPrompt = useMemo(() => {
    const todosStr = todos.map(t =>
      `${t.title} (${t.subject || 'ไม่ระบุวิชา'}, ส่ง: ${t.dueDate?.toLocaleDateString('th-TH') || '-'}, ${t.priority === 'urgent' ? 'ด่วน' : 'ปกติ'})`
    ).join(', ');

    const scheduleStr = todayClasses.map(c =>
      `${c.name} (${c.startTime}-${c.endTime}, ห้อง ${c.room || '-'})`
    ).join(', ');

    const notesStr = notes.slice(0, 5).map(n => n.title).join(', ');

    const base = buildSystemPrompt({
      todos: todosStr || 'ไม่มีงานค้าง',
      schedule: scheduleStr || 'ไม่มีเรียนวันนี้',
      notes: notesStr,
      memories,
    });

    return `${base}\n\nคุณกำลังตอบจาก "แบนเนอร์สรุปภาพรวม" ของหน้า Dashboard\nตอบสั้น กระชับ ไม่เกิน 3-4 ย่อหน้า ใช้ emoji ให้เป็นกันเอง`;
  }, [todos, todayClasses, notes, memories]);

  // Dynamic header text
  const headerText = useMemo(() => {
    if (pendingCount === 0 && todayClasses.length === 0) {
      return { title: '🎉 วันนี้เป็นวันที่ดี!', sub: 'ไม่มีงานค้างและไม่มีตารางเรียน พักผ่อนให้เต็มที่นะ' };
    }
    if (pendingCount === 0 && todayClasses.length > 0) {
      return { title: '✅ ไม่มีงานค้าง!', sub: `แต่วันนี้มีเรียน ${todayClasses.length} วิชา` };
    }
    const parts = [`คุณมีงานค้าง ${pendingCount} รายการ`];
    if (todayClasses.length > 0) parts.push(`เรียน ${todayClasses.length} วิชา`);
    return { title: 'สรุปภาพรวมวันนี้', sub: parts.join(' และ ') };
  }, [pendingCount, todayClasses.length]);

  const hasExpandableContent = todos.length > 0 || todayClasses.length > 0 || alerts.length > 0 || chatMessages.length > 0 || isTyping;

  const handleAskAI = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const query = input.trim();
    setInput('');
    setIsTyping(true);
    setIsExpanded(true);

    const userMsg: BannerMessage = { role: 'user', content: query };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);

    try {
      const apiMessages = [
        { role: 'system', content: bannerSystemPrompt },
        ...updatedMessages.map(m => ({ role: m.role, content: m.content })),
      ];

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (res.ok) {
        const data = await res.json();
        let content = data.content || 'ขออภัย ไม่สามารถตอบได้';
        content = content.replace(/แนะนำ:.*$/m, '').trim();
        setChatMessages(prev => [...prev, { role: 'assistant', content }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI' }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'ไม่สามารถติดต่อ AI ได้ในขณะนี้' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="ai-banner-container animate-in">
      <div className={`ai-banner ${isExpanded ? 'expanded' : ''}`}>
        {/* Header */}
        <div
          className="ai-banner-header"
          onClick={() => hasExpandableContent && setIsExpanded(!isExpanded)}
          style={{ cursor: hasExpandableContent ? 'pointer' : 'default' }}
        >
          <div className="ai-banner-icon">
            <IconSparkle size={24} />
          </div>
          <div className="ai-banner-text" style={{ flex: 1 }}>
            <h2>{headerText.title}</h2>
            <p>{headerText.sub}</p>
          </div>
          {hasExpandableContent && (
            <div className={`expand-indicator ${isExpanded ? 'active' : ''}`}>
              <IconChevronDown size={24} />
            </div>
          )}
        </div>

        {/* Expandable Detail Section */}
        {isExpanded && (
          <div className="ai-expanded-content">
            <div className="ai-divider" />

            {/* Pending Todos Detail */}
            {todos.length > 0 && (
              <div className="ai-detail-section">
                <div className="ai-detail-title">
                  <IconCheckSquare size={16} /> งานค้าง ({todos.length})
                </div>
                <div className="ai-detail-list">
                  {todos.slice(0, 5).map(t => (
                    <div key={t.id} className="ai-detail-item">
                      <div className="ai-detail-item-dot" data-urgent={t.priority === 'urgent'} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="ai-detail-item-title">{t.title}</div>
                        <div className="ai-detail-item-meta">
                          {t.subject && <span>{t.subject}</span>}
                          {t.dueDate && <span>ส่ง {t.dueDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</span>}
                        </div>
                      </div>
                      {t.priority === 'urgent' && <span className="ai-urgent-badge">ด่วน</span>}
                    </div>
                  ))}
                  {todos.length > 5 && (
                    <div style={{ fontSize: 12, opacity: 0.8, padding: '4px 0' }}>
                      และอีก {todos.length - 5} รายการ...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Today's Schedule */}
            {todayClasses.length > 0 && (
              <div className="ai-detail-section">
                <div className="ai-detail-title">
                  <IconCalendar size={16} /> ตารางเรียนวันนี้ ({todayClasses.length} วิชา)
                </div>
                <div className="ai-detail-list">
                  {todayClasses.map(c => (
                    <div key={c.id} className="ai-detail-item">
                      <div className="ai-detail-item-dot" style={{ background: c.color || 'white' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="ai-detail-item-title">{c.name}</div>
                        <div className="ai-detail-item-meta">
                          <span>{c.startTime} - {c.endTime}</span>
                          {c.room && <span>ห้อง {c.room}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Proactive AI Alerts */}
            {alerts.length > 0 && (
              <div className="ai-detail-section">
                <div className="ai-detail-title">
                  <IconSparkle size={16} /> AI แจ้งเตือน
                </div>
                <div className="ai-alerts-list">
                  {alerts.map((alert, i) => (
                    <div key={i} className={`ai-alert-item urgency-${alert.urgency}`}>
                      <div className="ai-alert-type-icon">
                        {alert.type === 'deadline' ? <IconClock size={16} /> : <IconSparkle size={16} />}
                      </div>
                      <div className="ai-alert-msg-box">
                        <div className="ai-alert-main-msg">{alert.message}</div>
                        <div className="ai-alert-sub-details">{alert.details}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Chat Messages */}
            {chatMessages.length > 0 && (
              <div className="ai-detail-section">
                <div className="ai-detail-title">
                  <IconSparkle size={16} /> สนทนากับ AI
                </div>
                <div className="ai-chat-thread">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`ai-thread-msg ${msg.role}`}>
                      <div className="ai-thread-bubble">
                        {msg.role === 'assistant' ? (
                          <div className="markdown-body-banner">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                          </div>
                        ) : msg.content}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="ai-thread-msg assistant">
                      <div className="ai-thread-bubble">
                        <div className="typing-indicator-small">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="ai-divider" />
          </div>
        )}

        {/* AI Input */}
        <form onSubmit={handleAskAI} className="ai-banner-input-wrapper" onClick={(e) => e.stopPropagation()}>
          <div className="ai-banner-input-inner">
            <IconSearch size={16} className="ai-input-icon" />
            <input
              type="text"
              placeholder="ถาม AI เกี่ยวกับงานหรือตารางเรียน..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="ai-banner-input"
            />
            <button type="submit" className="ai-banner-send" disabled={isTyping}>
              {isTyping ? '...' : <IconSend size={16} />}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .ai-banner-container { margin-bottom: 24px; }

        .ai-banner {
          background: linear-gradient(135deg, #FF6B1A 0%, #FF9A5C 100%);
          border-radius: 32px; padding: 26px; color: white;
          position: relative; overflow: hidden;
          box-shadow: 0 12px 40px rgba(255, 107, 26, 0.25);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        [data-theme="dark"] .ai-banner {
          background: linear-gradient(135deg, #E65100 0%, #FF9800 100%);
          box-shadow: 0 12px 50px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .ai-banner.expanded { box-shadow: 0 20px 60px rgba(255, 107, 26, 0.35); }
        .ai-banner::before {
          content: ''; position: absolute; top: -15%; right: -10%;
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
          border-radius: 50%; pointer-events: none;
        }

        .ai-banner-header {
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 20px; position: relative; z-index: 1;
        }
        .ai-banner-icon {
          width: 56px; height: 56px; background: rgba(255,255,255,0.25);
          backdrop-filter: blur(10px); border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: white; box-shadow: 0 8px 20px rgba(0,0,0,0.08); flex-shrink: 0;
        }
        .ai-banner-text h2 {
          font-size: 22px; font-weight: 800; color: white;
          margin: 0; letter-spacing: -0.02em;
        }
        .ai-banner-text p {
          font-size: 15px; color: rgba(255,255,255,0.95);
          margin: 4px 0 0; font-weight: 600;
        }
        .expand-indicator {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); opacity: 0.8;
        }
        .expand-indicator.active { transform: rotate(180deg); }

        .ai-expanded-content {
          position: relative; z-index: 1;
          margin-bottom: 20px;
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .ai-divider { height: 1px; background: rgba(255,255,255,0.2); margin: 16px 0; }

        /* Detail Sections */
        .ai-detail-section { margin-bottom: 16px; }
        .ai-detail-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; font-weight: 700; margin-bottom: 10px; opacity: 0.95;
        }
        .ai-detail-list {
          display: flex; flex-direction: column; gap: 6px;
        }
        .ai-detail-item {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.12); padding: 10px 14px;
          border-radius: 16px; font-size: 13px;
        }
        .ai-detail-item-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(255,255,255,0.7); flex-shrink: 0;
        }
        .ai-detail-item-dot[data-urgent="true"] {
          background: #ff4444; box-shadow: 0 0 8px rgba(255,68,68,0.5);
        }
        .ai-detail-item-title {
          font-weight: 600; font-size: 13px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .ai-detail-item-meta {
          display: flex; gap: 8px; font-size: 11px; opacity: 0.8; margin-top: 2px;
        }
        .ai-urgent-badge {
          background: rgba(255,68,68,0.3); border: 1px solid rgba(255,68,68,0.5);
          padding: 2px 8px; border-radius: 8px; font-size: 10px; font-weight: 700;
          flex-shrink: 0;
        }

        /* AI Chat Thread */
        .ai-chat-thread {
          display: flex; flex-direction: column; gap: 8px;
          max-height: 300px; overflow-y: auto;
        }
        .ai-thread-msg { display: flex; }
        .ai-thread-msg.user { justify-content: flex-end; }
        .ai-thread-msg.assistant { justify-content: flex-start; }
        .ai-thread-bubble {
          max-width: 85%; padding: 10px 14px; border-radius: 16px;
          font-size: 13px; line-height: 1.6;
        }
        .ai-thread-msg.user .ai-thread-bubble {
          background: rgba(255,255,255,0.3); border: 1px solid rgba(255,255,255,0.4);
        }
        .ai-thread-msg.assistant .ai-thread-bubble {
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2);
        }

        .markdown-body-banner { font-size: 13px; line-height: 1.6; }
        .markdown-body-banner p { margin: 0 0 8px; }
        .markdown-body-banner p:last-child { margin: 0; }
        .markdown-body-banner ul, .markdown-body-banner ol { margin: 4px 0; padding-left: 20px; }
        .markdown-body-banner li { margin: 2px 0; }
        .markdown-body-banner strong { font-weight: 700; }
        .markdown-body-banner code {
          background: rgba(255,255,255,0.15); padding: 1px 4px;
          border-radius: 4px; font-size: 12px;
        }

        /* Alerts */
        .ai-alerts-list { display: flex; flex-direction: column; gap: 8px; }
        .ai-alert-item {
          display: flex; gap: 12px; align-items: flex-start;
          background: rgba(255,255,255,0.1); padding: 12px;
          border-radius: 16px; border-left: 4px solid rgba(255,255,255,0.4);
        }
        .ai-alert-item.urgency-high {
          background: rgba(255,255,255,0.15); border-left-color: #fff;
        }
        .ai-alert-type-icon {
          width: 30px; height: 30px; border-radius: 10px;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .ai-alert-main-msg { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
        .ai-alert-sub-details { font-size: 12px; color: rgba(255,255,255,0.85); line-height: 1.4; }

        /* Input */
        .ai-banner-input-wrapper { position: relative; z-index: 1; max-width: 420px; }
        .ai-banner-input-inner {
          position: relative; display: flex; align-items: center;
          background: rgba(255,255,255,0.2); backdrop-filter: blur(15px);
          border: 1px solid rgba(255,255,255,0.3); border-radius: 999px;
          padding: 4px 4px 4px 16px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ai-banner-input-inner:focus-within {
          background: rgba(255,255,255,0.3);
          border-color: rgba(255,255,255,0.5); transform: translateY(-1px);
        }
        .ai-input-icon { color: rgba(255,255,255,0.8); margin-right: 10px; }
        .ai-banner-input {
          flex: 1; background: transparent; border: none; color: white;
          font-size: 14px; font-weight: 600; outline: none; height: 36px;
        }
        .ai-banner-input::placeholder { color: rgba(255,255,255,0.7); }
        .ai-banner-send {
          width: 36px; height: 36px; background: white; color: var(--accent);
          border: none; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .typing-indicator-small { display: flex; gap: 4px; padding: 4px 0; }
        .typing-indicator-small span {
          width: 6px; height: 6px; background: white; border-radius: 50%;
          animation: typing 1s infinite ease-in-out; opacity: 0.6;
        }
        .typing-indicator-small span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator-small span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .ai-banner { padding: 22px; border-radius: 28px; }
          .ai-banner-header { gap: 12px; }
          .ai-banner-icon { width: 48px; height: 48px; }
          .ai-banner-text h2 { font-size: 18px; }
          .ai-banner-text p { font-size: 13px; }
          .ai-banner-input-wrapper { max-width: none; }
        }
      `}</style>
    </div>
  );
}
