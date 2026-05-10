'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CHANGELOG, CURRENT_VERSION } from '@/lib/changelog';

export default function WhatsNewPopup() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const latest = CHANGELOG[0];

  useEffect(() => {
    setMounted(true);
  }, []);

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
    localStorage.setItem('jamdai_whats_new_dismissed', Date.now().toString());
  };

  const handleDontShowAgain = () => {
    setShow(false);
    localStorage.setItem('jamdai_whats_new_seen_version', CURRENT_VERSION);
    localStorage.removeItem('jamdai_whats_new_dismissed');
  };

  if (!show || !latest || !mounted) return null;

  const popupContent = (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          animation: 'wnFadeIn 0.3s ease',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 380,
        maxHeight: 'calc(100vh - 120px)',
        background: 'var(--surface-card, #fff)',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
        border: 'none',
        animation: 'wnSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column' as const,
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 20px 16px',
          background: 'linear-gradient(135deg, var(--orange, #ff6b1a) 0%, #ff6b35 100%)',
          color: '#fff', position: 'relative', flexShrink: 0,
        }}>
          <button
            onClick={handleClose}
            aria-label="ปิด"
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'rgba(255,255,255,0.25)', border: 'none',
              color: '#fff', borderRadius: 999, width: 34, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 16, fontWeight: 700,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >✕</button>
          <div style={{ fontSize: 32, marginBottom: 6 }}>🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>มีอะไรใหม่!</h2>
          <p style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
            JamDai {latest.version} — {latest.title}
          </p>
        </div>

        {/* Content - scrollable */}
        <div style={{
          padding: '12px 16px',
          overflowY: 'auto',
          flex: 1,
          minHeight: 0,
        }}>
          {latest.highlights.map((h, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, padding: '12px 0',
              borderBottom: i < latest.highlights.length - 1 ? '1px solid var(--border, #eee)' : 'none',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: 'var(--surface-raised, #f5f5f5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>{h.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary, #111)', marginBottom: 3 }}>
                  {h.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary, #666)', lineHeight: 1.6 }}>
                  {h.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 16px 20px',
          display: 'flex', gap: 8, flexDirection: 'column' as const,
          flexShrink: 0,
        }}>
          <button
            onClick={handleDontShowAgain}
            className="btn-primary"
            style={{
              width: '100%', padding: '14px 0', borderRadius: 14,
              fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
              background: 'var(--orange, #ff6b1a)', color: '#fff',
            }}
          >เข้าใจแล้ว!</button>
          <button
            onClick={handleClose}
            style={{
              width: '100%', padding: '10px 0', borderRadius: 14,
              fontSize: 12, color: 'var(--text-hint, #999)',
              background: 'transparent', border: 'none', cursor: 'pointer',
            }}
          >ไม่แสดงอีกใน 6 ชั่วโมง</button>
        </div>
      </div>

      <style>{`
        @keyframes wnFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes wnSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.92); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );

  // Use Portal to render at document.body level, escaping any parent scroll containers
  return createPortal(popupContent, document.body);
}
