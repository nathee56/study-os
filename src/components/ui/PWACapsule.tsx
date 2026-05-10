'use client';

import { usePWA } from '@/lib/hooks/usePWA';
import { IconDownload } from './Icons';

export default function PWACapsule() {
  const { installPrompt, isInstalled, installApp } = usePWA();

  if (isInstalled || !installPrompt) return null;

  return (
    <div 
      onClick={installApp}
      className="card animate-in"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '12px 20px', borderRadius: 999,
        background: 'var(--orange-light)', border: '1px dashed var(--orange)',
        cursor: 'pointer', marginBottom: 16, transition: 'all 0.2s',
      }}
    >
      <IconDownload size={16} style={{ color: 'var(--orange)' }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--orange)' }}>
        ติดตั้งแอป JamDai ลงเครื่องเพื่อประสบการณ์ที่ดีที่สุด
      </span>
    </div>
  );
}
