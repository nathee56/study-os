'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useTheme } from '@/lib/hooks/useTheme';
import { usePWA } from '@/lib/hooks/usePWA';
import { usePin } from '@/lib/hooks/usePin';
import { IconSun, IconMoon, IconLogOut, IconUser, IconCloud, IconDownload, IconAlertCircle } from '@/components/ui/Icons';
import { useState } from 'react';

export default function SettingsPage() {
  const { user, signOut, signIn, googleAccessToken } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { installPrompt, isInstalled, installApp } = usePWA();
  const { hasPin, setPin, verifyPin, clearPin } = usePin();

  const [showPinForm, setShowPinForm] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');
  const [pinError, setPinError] = useState('');

  const handleSetPin = async () => {
    setPinError('');
    if (newPin.length < 4 || newPin.length > 6) {
      setPinError('รหัสผ่านต้อง 4-6 หลัก');
      return;
    }
    if (!/^\d+$/.test(newPin)) {
      setPinError('รหัสผ่านต้องเป็นตัวเลขเท่านั้น');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    if (hasPin) {
      const ok = await verifyPin(currentPin);
      if (!ok) {
        setPinError('รหัสผ่านเดิมไม่ถูกต้อง');
        return;
      }
    }
    await setPin(newPin);
    setPinMsg('ตั้งรหัสผ่านสำเร็จ');
    setShowPinForm(false);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setTimeout(() => setPinMsg(''), 3000);
  };

  const handleRemovePin = async () => {
    setPinError('');
    if (hasPin) {
      const ok = await verifyPin(currentPin);
      if (!ok) {
        setPinError('รหัสผ่านเดิมไม่ถูกต้อง');
        return;
      }
    }
    await clearPin();
    setPinMsg('ลบรหัสผ่านสำเร็จ');
    setShowPinForm(false);
    setCurrentPin('');
    setTimeout(() => setPinMsg(''), 3000);
  };

  return (
    <div className="animate-in" style={{ maxWidth: 600 }}>
      {/* Profile */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>โปรไฟล์</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', overflow: 'hidden',
            background: 'var(--cream3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <IconUser size={24} style={{ color: 'var(--text-hint)' }} />
            )}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{user?.displayName || 'ผู้ใช้'}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user?.email}</div>
          </div>
        </div>
      </div>

      {/* PIN / Password */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>รหัสผ่าน (PIN)</h3>

        {pinMsg && (
          <div style={{ 
            padding: '10px 16px', borderRadius: 999, marginBottom: 16,
            background: 'var(--teal-soft)', color: 'var(--teal)', fontSize: 13, fontWeight: 600,
          }}>
            {pinMsg}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showPinForm ? 16 : 0 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              {hasPin ? 'มีรหัสผ่านแล้ว' : 'ยังไม่ได้ตั้งรหัสผ่าน'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-hint)' }}>
              {hasPin ? 'ใช้ยืนยันตัวตนเมื่อเปิดแอป' : 'ตั้งรหัสเพื่อความปลอดภัย'}
            </div>
          </div>
          <button
            className="btn-ghost"
            onClick={() => {
              setShowPinForm(!showPinForm);
              setPinError('');
              setCurrentPin('');
              setNewPin('');
              setConfirmPin('');
            }}
            style={{ fontSize: 13, padding: '8px 16px' }}
          >
            {hasPin ? 'เปลี่ยน / ลบ' : 'ตั้งรหัสผ่าน'}
          </button>
        </div>

        {showPinForm && (
          <div style={{ 
            padding: 20, borderRadius: 24, 
            background: 'var(--surface-base)', border: '1px solid var(--border)',
          }}>
            {hasPin && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  รหัสผ่านเดิม
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={currentPin}
                  onChange={(e) => { setCurrentPin(e.target.value.replace(/\D/g, '')); setPinError(''); }}
                  placeholder="●●●●"
                  style={{
                    width: '100%', height: 48, borderRadius: 999,
                    border: '1.5px solid var(--border-strong)',
                    background: 'var(--surface-card)',
                    textAlign: 'center', fontSize: 20, fontWeight: 700,
                    letterSpacing: 8, color: 'var(--text-primary)', outline: 'none',
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                รหัสผ่านใหม่ (4-6 หลัก)
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={newPin}
                onChange={(e) => { setNewPin(e.target.value.replace(/\D/g, '')); setPinError(''); }}
                placeholder="●●●●"
                style={{
                  width: '100%', height: 48, borderRadius: 999,
                  border: '1.5px solid var(--border-strong)',
                  background: 'var(--surface-card)',
                  textAlign: 'center', fontSize: 20, fontWeight: 700,
                  letterSpacing: 8, color: 'var(--text-primary)', outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                ยืนยันรหัสผ่านใหม่
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => { setConfirmPin(e.target.value.replace(/\D/g, '')); setPinError(''); }}
                placeholder="●●●●"
                style={{
                  width: '100%', height: 48, borderRadius: 999,
                  border: '1.5px solid var(--border-strong)',
                  background: 'var(--surface-card)',
                  textAlign: 'center', fontSize: 20, fontWeight: 700,
                  letterSpacing: 8, color: 'var(--text-primary)', outline: 'none',
                }}
              />
            </div>

            {pinError && (
              <p style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconAlertCircle size={14} /> {pinError}
              </p>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-primary" onClick={handleSetPin} style={{ flex: 1, height: 44, borderRadius: 999, justifyContent: 'center' }}>
                {hasPin ? 'เปลี่ยนรหัสผ่าน' : 'ตั้งรหัสผ่าน'}
              </button>
              {hasPin && (
                <button className="btn-ghost" onClick={handleRemovePin} style={{ height: 44, borderRadius: 999, justifyContent: 'center', color: 'var(--danger)', padding: '0 16px' }}>
                  ลบ PIN
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Theme */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>ธีม</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>โหมด {theme === 'light' ? 'สว่าง' : 'มืด'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-hint)' }}>เปลี่ยนรูปลักษณ์ของแอป</div>
          </div>
          <button className="btn-ghost" onClick={toggleTheme} style={{ gap: 8 }}>
            {theme === 'light' ? <IconMoon size={16} /> : <IconSun size={16} />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </div>

      {/* Integrations */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>การเชื่อมต่อ</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <IconCloud size={20} style={{ color: '#4285F4' }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Google Workspace</div>
              <div style={{ fontSize: 12, color: googleAccessToken ? 'var(--success)' : 'var(--text-hint)' }}>
                {googleAccessToken ? 'เชื่อมต่อแล้ว' : 'ยังไม่ได้เชื่อมต่อ'}
              </div>
            </div>
          </div>
          <button className="btn-ghost" onClick={signIn} style={{ fontSize: 12, padding: '6px 12px' }}>
            {googleAccessToken ? 'อัปเดตสิทธิ์' : 'เชื่อมต่อ'}
          </button>
        </div>
      </div>

      {/* PWA Install */}
      {!isInstalled && installPrompt && (
        <div className="card" style={{ marginBottom: 16, border: '1px solid var(--orange)', background: 'var(--orange-light)' }}>
          <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--orange)' }}>ติดตั้งแอปพลิเคชัน</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>
              ติดตั้ง Study OS ลงในเครื่องเพื่อเข้าถึงได้รวดเร็วขึ้น
            </div>
            <button className="btn-primary" onClick={installApp} style={{ gap: 8 }}>
              <IconDownload size={16} /> ติดตั้ง
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>เกี่ยวกับ</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
          <div>Study OS v1.0</div>
          <div>Productivity Workspace สำหรับนักศึกษา</div>
          <div>มหาวิทยาลัยราชภัฏนครสวรรค์</div>
          <div style={{ color: 'var(--text-hint)', fontSize: 11, marginTop: 4 }}>
            สร้างโดย รพีพัฒน์ กวางทอง
          </div>
        </div>
      </div>

      {/* Logout */}
      <button className="btn-ghost" onClick={signOut}
        style={{ width: '100%', justifyContent: 'center', color: 'var(--danger)', borderColor: 'var(--danger)', padding: 14 }}>
        <IconLogOut size={16} /> ออกจากระบบ
      </button>
    </div>
  );
}
