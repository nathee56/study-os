'use client';

import { useState } from 'react';
import { IconSparkle, IconSend, IconSearch } from './Icons';
import AIAlertCard from './AIAlertCard';
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
  const router = useRouter();

  const handleAskAI = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    
    // Store input in session and redirect to AI page
    sessionStorage.setItem('ai_initial_query', input.trim());
    router.push('/app/ai');
  };

  return (
    <div className="ai-banner-container animate-in">
      <div className="ai-banner">
        <div className="ai-banner-content">
          <div className="ai-banner-header">
            <div className="ai-banner-icon">
              <IconSparkle size={24} />
            </div>
            <div className="ai-banner-text">
              <h2>สรุปภาพรวมวันนี้</h2>
              <p>คุณมีงานค้าง {pendingCount} รายการ</p>
            </div>
          </div>

          <form onSubmit={handleAskAI} className="ai-banner-input-wrapper">
            <div className="ai-banner-input-inner">
              <IconSearch size={18} className="ai-input-icon" />
              <input 
                type="text" 
                placeholder="ถาม AI เกี่ยวกับงานของคุณ..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="ai-banner-input"
              />
              <button type="submit" className="ai-banner-send">
                <IconSend size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Upgraded System: Expandable Alerts integrated right below the banner */}
      <div style={{ marginTop: 16 }}>
        <AIAlertCard alerts={alerts} loading={loading} onDismiss={onDismiss} />
      </div>

      <style jsx>{`
        .ai-banner-container {
          margin-bottom: 24px;
        }

        .ai-banner {
          background: linear-gradient(135deg, #FF6B1A 0%, #FF9A5C 100%);
          border-radius: 32px;
          padding: 30px;
          color: white;
          position: relative;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(255, 107, 26, 0.25);
        }

        [data-theme="dark"] .ai-banner {
          background: linear-gradient(135deg, #2A1A0A 0%, #1A1208 100%);
          border: 1px solid rgba(255, 107, 26, 0.3);
          box-shadow: 0 12px 50px rgba(0, 0, 0, 0.5);
        }

        .ai-banner::before {
          content: '';
          position: absolute;
          top: -15%;
          right: -10%;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%);
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
          gap: 20px;
          margin-bottom: 24px;
        }

        .ai-banner-icon {
          width: 64px;
          height: 64px;
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
          font-size: 24px;
          font-weight: 800;
          color: white;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .ai-banner-text p {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.95);
          margin: 4px 0 0;
          font-weight: 600;
        }

        .ai-banner-input-wrapper {
          width: 100%;
        }

        .ai-banner-input-inner {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 999px;
          padding: 6px 6px 6px 20px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ai-banner-input-inner:focus-within {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .ai-input-icon {
          color: rgba(255, 255, 255, 0.8);
          margin-right: 14px;
        }

        .ai-banner-input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 16px;
          font-weight: 600;
          outline: none;
          height: 48px;
        }

        .ai-banner-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .ai-banner-send {
          width: 48px;
          height: 48px;
          background: white;
          color: var(--accent);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .ai-banner-send:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 768px) {
          .ai-banner {
            padding: 24px;
            border-radius: 28px;
          }
          .ai-banner-header {
            gap: 16px;
          }
          .ai-banner-icon {
            width: 52px;
            height: 52px;
          }
          .ai-banner-text h2 {
            font-size: 20px;
          }
          .ai-banner-text p {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
