'use client';

import { useState } from 'react';
import { IconSparkle, IconSend, IconSearch, IconChevronDown, IconClock } from './Icons';
import { AIAlert } from '@/lib/hooks/useAIAlert';
import { useRouter } from 'next/navigation';

interface AIBannerProps {
  pendingCount: number;
  alerts: AIAlert[];
  loading: boolean;
  onDismiss: (index: number) => void;
}

export default function AIBanner({ pendingCount, alerts, loading, onDismiss }: AIBannerProps) {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const router = useRouter();

  const handleAskAI = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    const query = input.trim();
    setInput('');
    setIsTyping(true);
    setIsExpanded(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: query }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.content);
      } else {
        setAiResponse('ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI');
      }
    } catch (err) {
      setAiResponse('ไม่สามารถติดต่อ AI ได้ในขณะนี้');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="ai-banner-container animate-in">
      <div 
        className={`ai-banner ${isExpanded ? 'expanded' : ''}`}
        onClick={() => (alerts.length > 0 || aiResponse) && setIsExpanded(!isExpanded)}
        style={{ cursor: (alerts.length > 0 || aiResponse) ? 'pointer' : 'default' }}
      >
        <div className="ai-banner-content">
          <div className="ai-banner-header">
            <div className="ai-banner-icon">
              <IconSparkle size={24} />
            </div>
            <div className="ai-banner-text" style={{ flex: 1 }}>
              <h2>สรุปภาพรวมวันนี้</h2>
              <p>คุณมีงานค้าง {pendingCount} รายการ</p>
            </div>
            {(alerts.length > 0 || aiResponse || isTyping) && (
              <div className={`expand-indicator ${isExpanded ? 'active' : ''}`}>
                 <IconChevronDown size={24} />
              </div>
            )}
          </div>

          {isExpanded && (alerts.length > 0 || aiResponse || isTyping) && (
            <div className="ai-expanded-content">
              <div className="ai-divider" />
              
              {/* AI Real-time Response */}
              {(aiResponse || isTyping) && (
                <div className="ai-chat-response">
                   <div className="ai-response-header">
                      <IconSparkle size={14} /> <span>คำตอบจาก AI</span>
                   </div>
                   <div className="ai-response-body">
                      {isTyping ? (
                        <div className="typing-indicator-small">
                          <span></span><span></span><span></span>
                        </div>
                      ) : (
                        <p>{aiResponse}</p>
                      )}
                   </div>
                </div>
              )}

              {/* Static Proactive Alerts */}
              {alerts.length > 0 && (
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
              )}
              <div className="ai-divider" />
            </div>
          )}

          <form onSubmit={handleAskAI} className="ai-banner-input-wrapper" onClick={(e) => e.stopPropagation()}>
            <div className="ai-banner-input-inner">
              <IconSearch size={16} className="ai-input-icon" />
              <input 
                type="text" 
                placeholder="ถาม AI ได้ที่นี่..." 
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
      </div>

      <style jsx>{`
        .ai-banner-container {
          margin-bottom: 24px;
        }

        .ai-banner {
          background: linear-gradient(135deg, #FF6B1A 0%, #FF9A5C 100%);
          border-radius: 32px;
          padding: 26px;
          color: white;
          position: relative;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(255, 107, 26, 0.25);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        [data-theme="dark"] .ai-banner {
          background: linear-gradient(135deg, #E65100 0%, #FF9800 100%);
          box-shadow: 0 12px 50px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ai-banner.expanded {
           box-shadow: 0 20px 60px rgba(255, 107, 26, 0.35);
        }

        .ai-banner::before {
          content: '';
          position: absolute;
          top: -15%;
          right: -10%;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .ai-banner-content {
          position: relative;
          z-index: 1;
        }

        .ai-banner-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .ai-banner-icon {
          width: 56px;
          height: 56px;
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          flex-shrink: 0;
        }

        .ai-banner-text h2 {
          font-size: 22px;
          font-weight: 800;
          color: white;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .ai-banner-text p {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.95);
          margin: 4px 0 0;
          font-weight: 600;
        }

        .expand-indicator {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0.8;
        }
        .expand-indicator.active {
          transform: rotate(180deg);
        }

        .ai-expanded-content {
          margin-bottom: 20px;
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .ai-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.2);
          margin: 16px 0;
        }

        .ai-chat-response {
          background: rgba(255, 255, 255, 0.15);
          padding: 16px;
          border-radius: 20px;
          margin-bottom: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .ai-response-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 8px;
          opacity: 0.9;
        }

        .ai-response-body {
          font-size: 14px;
          line-height: 1.6;
          font-weight: 500;
        }

        .ai-alerts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ai-alert-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          background: rgba(255, 255, 255, 0.1);
          padding: 12px;
          border-radius: 16px;
          border-left: 4px solid rgba(255, 255, 255, 0.4);
        }

        .ai-alert-item.urgency-high {
           background: rgba(255, 255, 255, 0.15);
           border-left-color: #fff;
        }

        .ai-alert-type-icon {
          width: 30px;
          height: 30px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ai-alert-main-msg {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .ai-alert-sub-details {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.4;
        }

        .ai-banner-input-wrapper {
          max-width: 320px;
        }

        .ai-banner-input-inner {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 999px;
          padding: 4px 4px 4px 16px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ai-banner-input-inner:focus-within {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-1px);
        }

        .ai-input-icon {
          color: rgba(255, 255, 255, 0.8);
          margin-right: 10px;
        }

        .ai-banner-input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          height: 36px;
        }

        .ai-banner-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .ai-banner-send {
          width: 36px;
          height: 36px;
          background: white;
          color: var(--accent);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .typing-indicator-small {
          display: flex;
          gap: 4px;
          padding: 4px 0;
        }
        .typing-indicator-small span {
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          animation: typing 1s infinite ease-in-out;
          opacity: 0.6;
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
