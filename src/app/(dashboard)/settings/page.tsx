'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useTheme } from '@/lib/hooks/useTheme';
import { IconSun, IconMoon, IconLogOut, IconUser, IconCloud } from '@/components/ui/Icons';

export default function SettingsPage() {
  const { user, signOut, signIn, googleAccessToken } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="animate-fade-in" style={{ maxWidth: 600 }}>
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
