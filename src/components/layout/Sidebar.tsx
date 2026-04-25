'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  IconHome, IconCheckSquare, IconCalendar, IconFileText,
  IconCpu, IconMessageCircle, IconSettings, IconLogOut, IconCloud, IconClock,
  IconMicrophone, IconBrain, IconLayout, IconTarget
} from '@/components/ui/Icons';

const baseNavItems = [
  { href: '/', label: 'Dashboard', icon: IconHome },
  { href: '/todo', label: 'To-Do List', icon: IconCheckSquare },
  { href: '/schedule', label: 'ตารางเรียน', icon: IconCalendar },
  { href: '/auto-schedule', label: 'Auto Schedule', icon: IconTarget },
  { href: '/notes', label: 'Notes', icon: IconFileText },
  { href: '/drive', label: 'Google Drive', icon: IconCloud },
  { href: '/knowledge-graph', label: 'Knowledge Graph', icon: IconBrain },
  { href: '/canvas', label: 'Deep Work Canvas', icon: IconLayout },
  { href: '/pomodoro', label: 'Focus Timer', icon: IconClock },
  { href: '/voice-tutor', label: 'Voice Tutor', icon: IconMicrophone },
  { href: '/ai-tools', label: 'AI Tools', icon: IconCpu },
  { href: '/ai', label: 'AI Assistant', icon: IconMessageCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isLocalMode, signOut } = useAuth();
  
  const navItems = baseNavItems.filter(item => {
    if (isLocalMode && item.href === '/drive') return false;
    return true;
  });

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: 'var(--text-primary)' }}>
          Study<span style={{ color: 'var(--orange)' }}>OS</span>
        </h2>
        <p style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 2 }}>
          Productivity Workspace
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, paddingTop: 8, overflowY: 'auto' }}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}

        <div style={{ margin: '8px 12px', borderTop: '0.5px solid var(--border)' }} />

        <Link
          href="/settings"
          className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
        >
          <IconSettings size={20} />
          <span>ตั้งค่า</span>
        </Link>
      </nav>

      {/* User Profile */}
      {user && (
        <div style={{
          padding: '16px', borderTop: '0.5px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', overflow: 'hidden',
            background: 'var(--cream3)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {user.displayName?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.displayName || 'ผู้ใช้'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-hint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
          </div>
          <button className="btn-icon" onClick={signOut} title="ออกจากระบบ">
            <IconLogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}
