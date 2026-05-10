'use client';

import { useState, useEffect } from 'react';
import { CHANGELOG, CURRENT_VERSION } from '@/lib/changelog';

export default function WhatsNewPopup() {
  const [show, setShow] = useState(false);
  const latest = CHANGELOG[0];

  useEffect(() => {
    if (!latest) return;

    const dismissedKey = `jamdai_whats_new_dismissed`;
    const seenVersionKey = `jamdai_whats_new_seen_version`;
    const dismissed = localStorage.getItem(dismissedKey);
    const seenVersion = localStorage.getItem(seenVersionKey);

    // Don't show if user already saw this version
    if (seenVersion === CURRENT_VERSION) return;

    // Don't show if dismissed within 6 hours
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const sixHours = 6 * 60 * 60 * 1000;
      if (Date.now() - dismissedAt < sixHours) return;
    }

    // Show popup after a brief delay for smooth UX
    const timer = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(timer);
  }, [latest]);

  const handleClose = () => {
    setShow(false);
    // Mark as dismissed for 6 hours
    localStorage.setItem('jamdai_whats_new_dismissed', Date.now().toString());
  };

  const handleDontShowAgain = () => {
    setShow(false);
    // Mark this version as seen permanently
    localStorage.setItem('jamdai_whats_new_seen_version', CURRENT_VERSION);
    localStorage.removeItem('jamdai_whats_new_dismissed');
  };

  if (!show || !latest) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.3s ease',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, pointerEvents: 'none',
      }}>
        <div style={{
          pointerEvents: 'auto',
          width: '100%', maxWidth: 420, maxHeight: '80vh',
          background: 'var(--surface-card)',
          borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          border: '1px solid var(--border)',
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {/* Header */}
          <div style={{
            padding: '24px 24px 16px',
            background: 'linear-gradient(135deg, var(--orange) 0%, #ff6b35 100%)',
            color: '#fff', position: 'relative',
          }}>
            <button
              onClick={handleClose}
              aria-label="ปิด"
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'rgba(255,255,255,0.2)', border: 'none',
                color: '#fff', borderRadius: 999, width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 16, fontWeight: 700,
                backdropFilter: 'blur(8px)',
              }}
            >✕</button>
            <div style={{ fontSize: 28, marginBottom: 4 }}>🎉</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>มีอะไรใหม่!</h2>
            <p style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
              JamDai {latest.version} — {latest.title}
            </p>
          </div>

          {/* Content */}
          <div style={{
            padding: '16px 20px', overflowY: 'auto', maxHeight: 'calc(80vh - 200px)',
          }}>
            {latest.highlights.map((h, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, padding: '12px 0',
                borderBottom: i < latest.highlights.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: 'var(--surface-raised)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>{h.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {h.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {h.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 20px 20px',
            display: 'flex', gap: 8, flexDirection: 'column',
          }}>
            <button
              onClick={handleDontShowAgain}
              className="btn-primary"
              style={{
                width: '100%', padding: '12px 0', borderRadius: 12,
                fontSize: 14, fontWeight: 700,
              }}
            >เข้าใจแล้ว!</button>
            <button
              onClick={handleClose}
              className="btn-ghost"
              style={{
                width: '100%', padding: '8px 0', borderRadius: 12,
                fontSize: 12, color: 'var(--text-hint)',
              }}
            >ไม่แสดงอีกใน 6 ชั่วโมง</button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
