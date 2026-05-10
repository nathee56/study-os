'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  IconHome, IconCheckSquare, IconCalendar, IconFileText,
  IconCpu, IconMessageCircle, IconSettings, IconLogOut, IconCloud, IconMail, IconClock, IconChevronLeft, IconChevronRight
} from '@/components/ui/Icons';
import { useState, useEffect } from 'react';

const nuNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: IconHome },
  { href: '/dashboard/todo', label: 'To-Do List', icon: IconCheckSquare },
  { href: '/dashboard/schedule', label: 'ตารางเรียน', icon: IconCalendar },
  { href: '/dashboard/notes', label: 'Notes', icon: IconFileText },
  { href: '/dashboard/pomodoro', label: 'Pomodoro', icon: IconClock },
  { href: '/dashboard/google-workspace', label: 'Google Workspace', icon: IconMail },
  { href: '/dashboard/ai-tools', label: 'AI Tools', icon: IconCpu },
  { href: '/dashboard/ai', label: 'AI Assistant', icon: IconMessageCircle },
];

const publicNavItems = [
  { href: '/app', label: 'หน้าแรก', icon: IconHome },
  { href: '/app/todo', label: 'งาน', icon: IconCheckSquare },
  { href: '/app/notes', label: 'โน้ต', icon: IconFileText },
  { href: '/app/pomodoro', label: 'Pomodoro', icon: IconClock },
  { href: '/app/ai', label: 'AI', icon: IconMessageCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isLocalMode, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Update CSS variable when collapsed state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.style.setProperty(
        '--sidebar-width', 
        isCollapsed ? '80px' : '220px'
      );
    }
  }, [isCollapsed]);
  
  const isNU = pathname.startsWith('/dashboard');
  
  // Local mode: only show core features
  const localNavItems = [
    { href: '/app', label: 'หน้าแรก', icon: IconHome },
    { href: '/app/todo', label: 'งาน', icon: IconCheckSquare },
    { href: '/app/notes', label: 'โน้ต', icon: IconFileText },
    { href: '/app/pomodoro', label: 'Pomodoro', icon: IconClock },
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
      <div style={{ padding: isCollapsed ? '24px 8px 16px' : '24px 16px 16px', display: 'flex', justifyContent: 'center' }}>
        {!isCollapsed ? (
          <div className="sidebar-logo-text" style={{ padding: '0 8px', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="JamDai" style={{ height: 56, objectFit: 'contain' }} />
          </div>
        ) : (
          <div className="sidebar-logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '12px', background: 'var(--orange-light)' }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--orange)' }}>J</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, paddingTop: 4, overflowY: 'auto', paddingLeft: isCollapsed ? 8 : 16, paddingRight: isCollapsed ? 8 : 16 }}>
        {filteredNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
            title={item.label}
            style={{ 
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              padding: isCollapsed ? '0' : '0 16px',
              width: isCollapsed ? '44px' : 'auto',
              margin: isCollapsed ? '4px auto' : '4px 8px'
            }}
          >
            <item.icon size={20} />
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        ))}

        <div style={{ margin: '12px 16px', borderTop: '0.5px solid var(--border)' }} />

        <Link
          href={isLocalMode ? '/app/settings' : isNU ? '/dashboard/settings' : '/app/settings'}
          className={`nav-item ${isActive('/settings') || isActive('/dashboard/settings') || isActive('/app/settings') ? 'active' : ''}`}
          title="ตั้งค่า"
          style={{ 
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '0' : '0 16px',
            width: isCollapsed ? '44px' : 'auto',
            margin: isCollapsed ? '4px auto' : '4px 8px'
          }}
        >
          <IconSettings size={20} />
          {!isCollapsed && <span>ตั้งค่า</span>}
        </Link>
      </nav>

      {/* Collapse Toggle */}
      <div style={{ padding: '8px', display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-end' }}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="btn-icon" 
          style={{ width: 32, height: 32, background: 'var(--surface-raised)' }}
          title={isCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
        >
          {isCollapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
        </button>
      </div>

      {/* User Profile */}
      {user ? (
        <div style={{
          padding: isCollapsed ? '16px 8px' : '16px', 
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', 
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', overflow: 'hidden',
            background: 'var(--surface-raised)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--surface-card)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>
                {user.displayName?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <>
              <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.displayName || 'ผู้ใช้'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </div>
              </div>
              <button className="btn-icon sidebar-user-info" onClick={signOut} title="ออกจากระบบ" style={{ width: 32, height: 32 }}>
                <IconLogOut size={16} />
              </button>
            </>
          )}
        </div>
      ) : isLocalMode && (
        <div style={{
          padding: isCollapsed ? '16px 8px' : '16px', 
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', 
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--surface-raised)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconCloud size={18} style={{ color: 'var(--text-secondary)' }} />
          </div>
          {!isCollapsed && (
            <>
              <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>โหมดส่วนตัว</div>
                <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>ข้อมูลเก็บในเครื่อง</div>
              </div>
              <button className="btn-icon sidebar-user-info" onClick={signOut} title="ออกจากระบบ" style={{ width: 32, height: 32 }}>
                <IconLogOut size={16} />
              </button>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
