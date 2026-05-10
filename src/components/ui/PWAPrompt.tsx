'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '@/lib/hooks/usePWA';

export default function PWAPrompt() {
  const { installPrompt, isInstalled, installApp } = usePWA();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isInstalled) return;
    
    // Check if dismissed before
    const dismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (!dismissed && installPrompt) {
      // Delay showing prompt to not be too aggressive
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isInstalled, installPrompt]);

  if (!show || isInstalled || !installPrompt) return null;

  const handleDismiss = () => {
    localStorage.setItem('pwa_prompt_dismissed', 'true');
    setShow(false);
  };

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, width: 'calc(100% - 32px)', maxWidth: 360,
      background: 'var(--surface-card)', border: '1px solid var(--accent)',
      borderRadius: 24, padding: 16, boxShadow: '0 8px 32px rgba(232, 101, 26, 0.2)',
      display: 'flex', alignItems: 'center', gap: 16, animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--surface-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <img src="/icon-192.png" alt="JamDai" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
          ติดตั้ง JamDai
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          เพื่อการใช้งานที่ลื่นไหล
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button className="btn-primary" onClick={installApp} style={{ padding: '6px 16px', fontSize: 12, height: 'auto', borderRadius: 999 }}>
          ติดตั้ง
        </button>
        <button onClick={handleDismiss} style={{ background: 'none', border: 'none', color: 'var(--text-hint)', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
          ไว้ทีหลัง
        </button>
      </div>
    </div>
  );
}
