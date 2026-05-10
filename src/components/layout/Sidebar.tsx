'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  IconHome, IconCheckSquare, IconCalendar, IconFileText,
  IconCpu, IconMessageCircle, IconSettings, IconLogOut, IconCloud, IconMail
} from '@/components/ui/Icons';

const nuNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: IconHome },
  { href: '/dashboard/todo', label: 'To-Do List', icon: IconCheckSquare },
  { href: '/dashboard/schedule', label: 'ตารางเรียน', icon: IconCalendar },
  { href: '/dashboard/notes', label: 'Notes', icon: IconFileText },
  { href: '/dashboard/google-workspace', label: 'Google Workspace', icon: IconMail },
  { href: '/dashboard/ai-tools', label: 'AI Tools', icon: IconCpu },
  { href: '/dashboard/ai', label: 'AI Assistant', icon: IconMessageCircle },
];

const publicNavItems = [
  { href: '/app', label: 'หน้าแรก', icon: IconHome },
  { href: '/app/todo', label: 'งาน', icon: IconCheckSquare },
  { href: '/app/notes', label: 'โน้ต', icon: IconFileText },
  { href: '/app/ai', label: 'AI', icon: IconMessageCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isLocalMode, signOut } = useAuth();
  
  const isNU = pathname.startsWith('/dashboard');
  
  // Local mode: only show core features
  const localNavItems = [
    { href: '/app', label: 'หน้าแรก', icon: IconHome },
    { href: '/app/todo', label: 'งาน', icon: IconCheckSquare },
    { href: '/app/notes', label: 'โน้ต', icon: IconFileText },
    { href: '/app/ai', label: 'AI', icon: IconMessageCircle },
  ];
  
  const navItems = isLocalMode ? localNavItems : isNU ? nuNavItems : publicNavItems;

  const filteredNavItems = navItems;

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/app') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '24px 16px 16px' }}>
        <div className="sidebar-logo-text" style={{ padding: '0 8px', display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="JamDai" style={{ height: 56, objectFit: 'contain' }} />
        </div>
        {/* Tablet icon-only logo */}
        <div className="sidebar-logo-icon" style={{ display: 'none', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--accent)' }}>J</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, paddingTop: 4, overflowY: 'auto' }}>
        {filteredNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
            title={item.label}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        ))}

        <div style={{ margin: '8px 8px', borderTop: '0.5px solid var(--border)' }} />

        <Link
          href={isLocalMode ? '/app/settings' : isNU ? '/dashboard/settings' : '/app/settings'}
          className={`nav-item ${isActive('/settings') || isActive('/dashboard/settings') || isActive('/app/settings') ? 'active' : ''}`}
          title="ตั้งค่า"
        >
          <IconSettings size={18} />
          <span>ตั้งค่า</span>
        </Link>
      </nav>

      {/* User Profile */}
      {user ? (
        <div style={{
          padding: '16px', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', overflow: 'hidden',
            background: 'var(--surface-raised)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>
                {user.displayName?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.displayName || 'ผู้ใช้'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
          </div>
          <button className="btn-icon sidebar-user-info" onClick={signOut} title="ออกจากระบบ" style={{ width: 32, height: 32 }}>
            <IconLogOut size={16} />
          </button>
        </div>
      ) : isLocalMode && (
        <div style={{
          padding: '16px', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--surface-raised)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-hint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>โหมดส่วนตัว</div>
            <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>ข้อมูลเก็บในเครื่อง</div>
          </div>
          <button className="btn-icon sidebar-user-info" onClick={signOut} title="ออกจากระบบ" style={{ width: 32, height: 32 }}>
            <IconLogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}
