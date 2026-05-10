'use client';

import { useState, useRef, useEffect } from 'react';
import { usePin } from '@/lib/hooks/usePin';
import { useAuth } from '@/lib/hooks/useAuth';

export default function LockScreen({ children }: { children: React.ReactNode }) {
  const { hasPin, isLocked, verifyPin, clearPin, loading } = usePin();
  const { isLocalMode } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const PIN_LENGTH = 6;

  // Focus first input on mount
  useEffect(() => {
    if (isLocked && hasPin && !loading) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isLocked, hasPin, loading]);

  if (loading) return null;
  if (!hasPin || !isLocked) return <>{children}</>;

  const handleDigit = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = pin.substring(0, index) + value + pin.substring(index + 1);
    setPin(newPin.substring(0, PIN_LENGTH));
    setError('');

    // Auto-advance to next input
    if (value && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newPin.length === PIN_LENGTH && value) {
      handleSubmit(newPin.substring(0, PIN_LENGTH));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newPin = pin.substring(0, index - 1) + pin.substring(index);
      setPin(newPin);
    }
  };

  const handleSubmit = async (pinValue?: string) => {
    const p = pinValue || pin;
    if (p.length < 4) {
      setError('กรุณากรอกรหัสผ่านอย่างน้อย 4 หลัก');
      return;
    }
    setVerifying(true);
    const ok = await verifyPin(p);
    setVerifying(false);
    if (!ok) {
      setError('รหัสผ่านไม่ถูกต้อง');
      setPin('');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  };

  const handleForgotPin = async () => {
    if (isLocalMode) {
      if (confirm('การรีเซ็ตรหัสผ่านจะล้างข้อมูลทั้งหมดในเครื่อง (To-Do, โน้ต, การตั้งค่า) คุณต้องการดำเนินการต่อหรือไม่?')) {
        localStorage.clear();
        window.location.href = '/login';
      }
    } else {
      await clearPin();
      setShowForgot(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--bg)', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ maxWidth: 360, width: '100%', textAlign: 'center' }}>
        {/* Logo */}
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>
          Study<span style={{ color: 'var(--accent)' }}>OS</span>
        </h1>

        {/* Lock Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 999, margin: '0 auto 24px',
          background: 'var(--accent-soft)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>

        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          กรอกรหัสผ่านเพื่อเข้าใช้งาน
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-hint)', marginBottom: 32 }}>
          ป้อน PIN {PIN_LENGTH} หลักของคุณ
        </p>

        {/* PIN Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={pin[i] || ''}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={{
                width: 48, height: 56,
                borderRadius: 16,
                border: `2px solid ${error ? 'var(--danger)' : pin[i] ? 'var(--accent)' : 'var(--border-strong)'}`,
                background: 'var(--surface-card)',
                textAlign: 'center',
                fontSize: 24, fontWeight: 700,
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.2s, transform 0.2s',
                transform: pin[i] ? 'scale(1.05)' : 'scale(1)',
                caretColor: 'transparent',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => { if (!pin[i]) e.target.style.borderColor = 'var(--border-strong)'; }}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p style={{
            fontSize: 13, color: 'var(--danger)', fontWeight: 600,
            marginBottom: 16, animation: 'shake 0.3s ease-in-out',
          }}>
            {error}
          </p>
        )}

        {/* Verifying state */}
        {verifying && (
          <p style={{ fontSize: 13, color: 'var(--text-hint)', marginBottom: 16 }}>
            กำลังตรวจสอบ...
          </p>
        )}

        {/* Forgot PIN */}
        {!showForgot ? (
          <button
            onClick={() => setShowForgot(true)}
            style={{
              background: 'none', border: 'none', color: 'var(--text-hint)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              padding: '8px 16px', marginTop: 8,
            }}
          >
            ลืมรหัสผ่าน?
          </button>
        ) : (
          <div style={{
            marginTop: 16, padding: 20, borderRadius: 24,
            background: 'var(--surface-card)', border: '1px solid var(--border)',
            textAlign: 'left',
          }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              {isLocalMode ? 'รีเซ็ตรหัสผ่าน' : 'ล้างรหัสผ่าน'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
              {isLocalMode
                ? 'การรีเซ็ตจะล้างข้อมูลทั้งหมดในเครื่อง (To-Do, โน้ต, การตั้งค่า) ไม่สามารถกู้คืนได้'
                : 'ระบบจะล้าง PIN ออก คุณสามารถตั้ง PIN ใหม่ได้ในหน้าตั้งค่า'
              }
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowForgot(false)}
                className="btn-ghost"
                style={{ flex: 1, height: 44, borderRadius: 999, justifyContent: 'center' }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleForgotPin}
                className="btn-primary"
                style={{
                  flex: 1, height: 44, borderRadius: 999, justifyContent: 'center',
                  background: 'var(--danger)',
                }}
              >
                {isLocalMode ? 'ล้างข้อมูลทั้งหมด' : 'ล้าง PIN'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-4px); }
        }
      `}</style>
    </div>
  );
}
