'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import { usePin } from '@/lib/hooks/usePin';
import {
  IconSparkle, IconCheckSquare, IconCalendar, IconFileText,
  IconMessageCircle, IconCheck, IconAlertCircle,
} from '@/components/ui/Icons';

const TOTAL_SLIDES = 6;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLocalMode, loading: authLoading } = useAuth();
  const { needsOnboarding, completeOnboarding, loading: onboardingLoading } = useOnboarding();
  const { setPin } = usePin();
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [animating, setAnimating] = useState(false);

  // PIN state
  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');
  const [pinError, setPinError] = useState('');
  const [skipPin, setSkipPin] = useState(false);

  // Redirect if onboarding already done
  useEffect(() => {
    if (!authLoading && !onboardingLoading && !needsOnboarding) {
      const dest = isLocalMode ? '/app' : (user ? '/dashboard' : '/login');
      router.replace(dest);
    }
  }, [authLoading, onboardingLoading, needsOnboarding, isLocalMode, user, router]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !onboardingLoading && !user && !isLocalMode) {
      router.replace('/login');
    }
  }, [authLoading, onboardingLoading, user, isLocalMode, router]);

  const goNext = useCallback(() => {
    if (animating || slide >= TOTAL_SLIDES - 1) return;
    setDirection('left');
    setAnimating(true);
    setTimeout(() => {
      setSlide(s => s + 1);
      setAnimating(false);
    }, 200);
  }, [animating, slide]);

  const goSkip = useCallback(() => {
    // Skip to last slide (PIN setup) — or complete if on last slide
    if (slide >= TOTAL_SLIDES - 1) return;
    setDirection('left');
    setAnimating(true);
    setTimeout(() => {
      setSlide(TOTAL_SLIDES - 1);
      setAnimating(false);
    }, 200);
  }, [slide]);

  const handleComplete = useCallback(async () => {
    if (!skipPin) {
      // Validate PIN
      if (pin1.length < 4) {
        setPinError('กรุณากรอกรหัสผ่านอย่างน้อย 4 หลัก');
        return;
      }
      if (pin1.length > 6) {
        setPinError('รหัสผ่านต้องไม่เกิน 6 หลัก');
        return;
      }
      if (pin1 !== pin2) {
        setPinError('รหัสผ่านไม่ตรงกัน กรุณาลองใหม่');
        return;
      }
      await setPin(pin1);
    }
    await completeOnboarding();
    const dest = isLocalMode ? '/app' : '/dashboard';
    router.replace(dest);
  }, [pin1, pin2, skipPin, setPin, completeOnboarding, isLocalMode, router]);

  if (authLoading || onboardingLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <img src="/logo.png" alt="JamDai" style={{ height: 160, width: 'auto', maxWidth: '80vw', objectFit: 'contain' }} />
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-hint)' }}>กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!needsOnboarding) return null;

  const slideContent = [
    // ── SLIDE 1: Welcome ──
    <div key="welcome" style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <img src="/logo.png" alt="JamDai" style={{ height: 96, objectFit: 'contain' }} />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        ยินดีต้อนรับสู่ JamDai
      </h2>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.6 }}>
        ผู้ช่วยการเรียนส่วนตัวที่เข้าใจคุณ
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 320, margin: '0 auto' }}>
        {[
          { icon: <IconSparkle size={22} style={{ color: 'var(--accent)' }} />, text: 'ผู้ช่วย AI ภาษาไทย', bg: 'var(--accent-soft)' },
          { icon: <IconCheckSquare size={22} style={{ color: 'var(--teal)' }} />, text: 'จัดการงานและโน้ต', bg: 'var(--teal-soft)' },
          { icon: <IconCalendar size={22} style={{ color: 'var(--violet)' }} />, text: 'ตารางเรียนอัตโนมัติ', bg: 'var(--violet-soft)' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '16px 20px', borderRadius: 999,
            background: 'var(--surface-card)', border: '1px solid var(--border)',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 999,
              background: item.bg, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {item.icon}
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>,

    // ── SLIDE 2: Dashboard ──
    <div key="dashboard" style={{ textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, borderRadius: 999, margin: '0 auto 24px',
        background: 'var(--accent-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
        Dashboard อัจฉริยะ
      </h2>
      <div style={{
        padding: 20, borderRadius: 24,
        background: 'var(--surface-card)', border: '1px solid var(--border)',
        textAlign: 'left', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconSparkle size={18} style={{ color: 'var(--accent)' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>AI สรุปวันนี้</span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          AI สรุปวันนี้ให้คุณทุกเช้า — บอกว่ามีงานอะไร คาบอะไร และควรทำอะไรก่อน
        </p>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-hint)', lineHeight: 1.6 }}>
        เห็นภาพรวมทุกอย่างในหน้าเดียว<br />To-Do, ตารางเรียน, โน้ต และ AI
      </p>
    </div>,

    // ── SLIDE 3: To-Do List ──
    <div key="todo" style={{ textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, borderRadius: 999, margin: '0 auto 24px',
        background: 'var(--teal-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <IconCheckSquare size={40} style={{ color: 'var(--teal)' }} />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
        จัดการงานได้ง่ายดาย
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        <div style={{
          padding: 16, borderRadius: 24,
          background: 'var(--surface-card)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left',
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 20 }}>+</span>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>กดปุ่ม + เพื่อเพิ่มงานได้ทันที</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>ตั้ง deadline, ความสำคัญ และ AI จะเตือนคุณเอง</p>
          </div>
        </div>
        <div style={{
          padding: 16, borderRadius: 24,
          background: 'var(--surface-card)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left',
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--teal-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IconCheck size={20} style={{ color: 'var(--teal)' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>ติ๊กเสร็จแล้วขีดฆ่าออก</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>รู้สึก productive ทุกวัน</p>
          </div>
        </div>
      </div>
    </div>,

    // ── SLIDE 4: Notes + AI ──
    <div key="notes" style={{ textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, borderRadius: 999, margin: '0 auto 24px',
        background: 'var(--violet-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <IconFileText size={40} style={{ color: 'var(--violet)' }} />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
        โน้ต + AI ฉลาดกว่า
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        <div style={{
          padding: 16, borderRadius: 24,
          background: 'var(--surface-card)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left',
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--violet-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IconFileText size={20} style={{ color: 'var(--violet)' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>จดโน้ตได้ทุกวิชา เปลี่ยนสีได้</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>เหมือน Google Keep แต่ฉลาดกว่า</p>
          </div>
        </div>
        <div style={{
          padding: 16, borderRadius: 24,
          background: 'var(--surface-card)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left',
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IconSparkle size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>กด &ldquo;AI สรุป&rdquo;</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>AI อ่านโน้ตของคุณ แล้วสรุป ตั้งคำถาม หรืออธิบายเพิ่มให้</p>
          </div>
        </div>
      </div>
    </div>,

    // ── SLIDE 5: AI Assistant ──
    <div key="ai" style={{ textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, borderRadius: 999, margin: '0 auto 24px',
        background: 'var(--accent-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <IconMessageCircle size={40} style={{ color: 'var(--accent)' }} />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        AI รู้จักคุณ
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
        ถามได้ทุกอย่าง AI เห็น To-Do, โน้ต<br />และตารางเรียนของคุณทั้งหมด
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          'งานอะไรที่ต้องส่งพรุ่งนี้?',
          'สรุปโน้ต CS301 ให้หน่อย',
          'วางแผนอ่านหนังสือสอบให้หน่อย',
        ].map((q, i) => (
          <div key={i} style={{
            padding: '14px 20px', borderRadius: 999,
            background: 'var(--surface-card)', border: '1px solid var(--border)',
            fontSize: 14, fontWeight: 500, color: 'var(--text-primary)',
            textAlign: 'left',
          }}>
            &ldquo;{q}&rdquo;
          </div>
        ))}
      </div>
    </div>,

    // ── SLIDE 6: PIN Setup ──
    <div key="pin" style={{ textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, borderRadius: 999, margin: '0 auto 24px',
        background: 'var(--surface-raised)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        ตั้งรหัสผ่านเพื่อความปลอดภัย
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 28 }}>
        ใช้ยืนยันตัวตนทุกครั้งที่เปิดแอป<br />ป้องกันคนอื่นเข้าถึงข้อมูลของคุณ
      </p>

      {!skipPin ? (
        <div style={{ maxWidth: 280, margin: '0 auto' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textAlign: 'left' }}>
              รหัสผ่าน (4-6 หลัก)
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin1}
              onChange={(e) => { setPin1(e.target.value.replace(/\D/g, '')); setPinError(''); }}
              placeholder="●●●●"
              style={{
                width: '100%', height: 52, borderRadius: 999,
                border: `2px solid ${pinError ? 'var(--danger)' : 'var(--border-strong)'}`,
                background: 'var(--surface-card)',
                textAlign: 'center', fontSize: 24, fontWeight: 700,
                letterSpacing: 8, color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textAlign: 'left' }}>
              ยืนยันรหัสผ่านอีกครั้ง
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin2}
              onChange={(e) => { setPin2(e.target.value.replace(/\D/g, '')); setPinError(''); }}
              placeholder="●●●●"
              style={{
                width: '100%', height: 52, borderRadius: 999,
                border: `2px solid ${pinError ? 'var(--danger)' : 'var(--border-strong)'}`,
                background: 'var(--surface-card)',
                textAlign: 'center', fontSize: 24, fontWeight: 700,
                letterSpacing: 8, color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>
          {pinError && (
            <p style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              <IconAlertCircle size={14} /> {pinError}
            </p>
          )}
        </div>
      ) : (
        <div style={{
          padding: 16, borderRadius: 24,
          background: 'rgba(244, 63, 94, 0.06)', border: '1px solid rgba(244, 63, 94, 0.15)',
          marginBottom: 12,
        }}>
          <p style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 500, lineHeight: 1.5 }}>
            ใครก็สามารถเปิดดูข้อมูลของคุณได้
          </p>
        </div>
      )}

      {/* Skip toggle */}
      <button
        onClick={() => setSkipPin(!skipPin)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          margin: '20px auto 0', padding: '10px 20px',
          background: 'none', border: 'none',
          cursor: 'pointer', fontSize: 13, fontWeight: 500,
          color: 'var(--text-hint)',
        }}
      >
        <div style={{
          width: 44, height: 24, borderRadius: 12,
          background: skipPin ? 'var(--accent)' : 'var(--border-strong)',
          position: 'relative', transition: 'background 0.2s',
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: '#fff', position: 'absolute',
            top: 2, left: skipPin ? 22 : 2,
            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }} />
        </div>
        ข้ามขั้นตอนนี้ (ไม่แนะนำ)
      </button>
    </div>,
  ];

  const isLastSlide = slide === TOTAL_SLIDES - 1;

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Top bar: progress dots + skip */}
      <div style={{
        width: '100%', maxWidth: 480, padding: '20px 24px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <div key={i} style={{
              width: i === slide ? 24 : 8, height: 8,
              borderRadius: 999,
              background: i === slide ? 'var(--accent)' : i < slide ? 'var(--accent)' : 'var(--border-strong)',
              opacity: i < slide ? 0.4 : 1,
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }} />
          ))}
        </div>

        {/* Skip button — hidden on last slide */}
        {!isLastSlide && (
          <button
            onClick={goSkip}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-hint)', fontSize: 14, fontWeight: 500,
              cursor: 'pointer', padding: '8px 0',
            }}
          >
            ข้าม
          </button>
        )}
      </div>

      {/* Slide content */}
      <div style={{
        flex: 1, width: '100%', maxWidth: 480,
        padding: '40px 24px 120px',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        opacity: animating ? 0 : 1,
        transform: animating
          ? `translateX(${direction === 'left' ? '-20px' : '20px'})`
          : 'translateX(0)',
        transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
      }}>
        {slideContent[slide]}
      </div>

      {/* Bottom button */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '16px 24px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        display: 'flex', justifyContent: 'center',
        background: 'linear-gradient(to top, var(--bg) 60%, transparent)',
      }}>
        <button
          className="btn-primary"
          onClick={isLastSlide ? handleComplete : goNext}
          style={{
            width: '100%', maxWidth: 480, height: 56,
            borderRadius: 999, fontSize: 16, fontWeight: 700,
            justifyContent: 'center',
          }}
        >
          {slide === 0
            ? 'เริ่มต้นใช้งาน →'
            : isLastSlide
              ? (skipPin ? 'เข้าใช้งานโดยไม่มีรหัสผ่าน' : 'ตั้งรหัสผ่านและเริ่มใช้งาน')
              : 'ถัดไป →'
          }
        </button>
      </div>
    </div>
  );
}
