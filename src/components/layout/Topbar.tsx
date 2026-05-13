'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/lib/hooks/useTheme';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  IconSun, IconMoon, IconPlus, IconMenu, IconX, IconSearch,
  IconCalendar, IconFileText, IconCpu, IconSettings, IconHome, IconCheckSquare, IconMessageCircle, IconCamera
} from '@/components/ui/Icons';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, isLocalMode, signIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocalTooltip, setShowLocalTooltip] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const basePath = '/app';

  const menuItems = [
    { href: '/app', label: 'หน้าแรก', icon: IconHome },
    { href: '/app/todo', label: 'งาน (To-Do)', icon: IconCheckSquare },
    { href: '/app/schedule', label: 'ตารางเรียน', icon: IconCalendar },
    { href: '/app/notes', label: 'โน้ต (Notes)', icon: IconFileText },
    { href: '/app/scan', label: 'สแกนโน้ต (AI)', icon: IconCamera },
    { href: '/app/ai', label: 'AI Assistant', icon: IconMessageCircle },
    { href: '/app/settings', label: 'ตั้งค่า', icon: IconSettings },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`${basePath}/ai?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleToggleTheme = () => {
    toggleTheme();
  };

  return (
    <>
    <header className="topbar" style={isMobile ? { height: 56, padding: '0 16px' } : undefined}>
      {/* Left section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isMobile && (
          <button 
            className="btn-icon" 
            onClick={() => setIsMenuOpen(true)} 
            style={{ 
              width: 40, height: 40, 
              borderRadius: 999,
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
            }}
            aria-label="เปิดเมนู"
          >
            <IconMenu size={18} />
          </button>
        )}
        {!isMobile && (
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h1>
            {subtitle && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontWeight: 400 }}>{subtitle}</p>
            )}
          </div>
        )}
      </div>

      {/* Center — mobile only */}
      {isMobile && (
        <h1 style={{ 
          fontSize: 16, fontWeight: 600,
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          maxWidth: '50%'
        }}>
          {title}
        </h1>
      )}

      {/* Right section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Search — desktop/tablet only */}
        {!isMobile && (
          <div style={{ position: 'relative', width: 220 }}>
            <IconSearch size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input"
              placeholder="ค้นหา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              style={{ paddingLeft: 36, height: 40, fontSize: 14, borderRadius: 999 }}
            />
          </div>
        )}

        {/* Local Mode Badge */}
        {isLocalMode && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowLocalTooltip(!showLocalTooltip)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: isMobile ? '6px 12px' : '8px 16px',
                background: 'var(--surface-raised)', border: '1px solid var(--border)',
                borderRadius: 999, cursor: 'pointer', fontSize: 12,
                color: 'var(--text-primary)', fontWeight: 600,
                transition: 'all 0.2s',
              }}
              title="โหมดส่วนตัว"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              {!isMobile && <span>โหมดส่วนตัว</span>}
            </button>
            {showLocalTooltip && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setShowLocalTooltip(false)} />
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 12,
                  background: 'var(--surface-card)', border: '1px solid var(--border-strong)',
                  borderRadius: 20, padding: 20, width: 280, zIndex: 99,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
                }}>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                    ข้อมูลเก็บในเครื่องนี้เท่านั้น<br />
                    กดเพื่อเชื่อมต่อ Google และ sync ข้อมูล
                  </p>
                  <button
                    className="btn-primary"
                    onClick={() => { setShowLocalTooltip(false); signIn(); }}
                    style={{ width: '100%', padding: '8px 12px', fontSize: 12, borderRadius: 8 }}
                  >
                    เชื่อมต่อ Google
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Dark mode toggle */}
        <button 
          className="btn-icon" 
          onClick={handleToggleTheme} 
          title={theme === 'light' ? 'เปลี่ยนเป็นโหมดมืด' : 'เปลี่ยนเป็นโหมดสว่าง'} 
          style={{ 
            width: 40, height: 40,
            borderRadius: 999,
            background: theme === 'dark' ? 'rgba(255,190,36,0.12)' : 'rgba(100,100,180,0.08)',
          }}
          aria-label="สลับธีม"
        >
          {theme === 'light' ? <IconMoon size={18} style={{ color: 'var(--violet)' }} /> : <IconSun size={18} style={{ color: 'var(--amber)' }} />}
        </button>
        
        {/* Quick add — desktop/tablet only */}
        {!isMobile && (
          <button className="btn-primary" onClick={() => router.push(`${basePath}/notes?new=1`)} style={{ padding: '0 20px', fontSize: 14, borderRadius: 999, gap: 6, height: 40 }}>
            <IconPlus size={16} /> สร้างโน้ต
          </button>
        )}

        {/* Avatar */}
        {user && (
          <div style={{
            width: 40, height: 40, borderRadius: 999, overflow: 'hidden',
            background: 'linear-gradient(135deg, var(--accent-soft), var(--violet-soft))', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, border: '1.5px solid var(--border-strong)',
          }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                {user.displayName?.charAt(0) || 'U'}
              </span>
            )}
          </div>
        )}
      </div>
    </header>

    {/* Mobile Drawer — Premium Rounded Design (v3.0) */}
    {isMenuOpen && (
      <div className="mobile-only" style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
        {/* Backdrop */}
        <div 
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }} 
          onClick={() => setIsMenuOpen(false)} 
        />
        {/* Drawer Panel */}
        <div style={{ 
          position: 'absolute', top: 12, bottom: 12, left: 12, width: 'calc(100vw - 80px)', maxWidth: 300,
          background: 'color-mix(in srgb, var(--surface-card) 92%, transparent)',
          backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 28,
          display: 'flex', flexDirection: 'column',
          animation: 'drawerSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.25)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '24px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/logo.png" alt="JamDai" style={{ height: 38, objectFit: 'contain' }} />
              <span style={{ 
                background: 'linear-gradient(135deg, var(--accent), #FF9A5C)',
                color: 'white', fontSize: 9, padding: '3px 8px', 
                borderRadius: 99, fontWeight: 700, letterSpacing: '0.5px',
              }}>BETA</span>
            </div>
            <button onClick={() => setIsMenuOpen(false)} style={{ 
              width: 40, height: 40, borderRadius: 99, border: 'none', cursor: 'pointer',
              background: 'var(--surface-raised)', color: 'var(--text-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}>
              <IconX size={18} />
            </button>
          </div>

          {/* Nav Items */}
          <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {menuItems.map((item, i) => {
              const active = (item.href === '/app') ? pathname === item.href : pathname.startsWith(item.href);
              const colors = [
                { bg: 'var(--accent-soft)', fg: 'var(--accent)' },
                { bg: 'var(--sky-soft)', fg: 'var(--sky)' },
                { bg: 'var(--violet-soft)', fg: 'var(--violet)' },
                { bg: 'var(--teal-soft)', fg: 'var(--teal)' },
                { bg: 'var(--rose-soft)', fg: 'var(--rose)' },
                { bg: 'var(--amber-soft)', fg: 'var(--amber)' },
                { bg: 'var(--sky-soft)', fg: 'var(--sky)' },
              ];
              const c = colors[i % colors.length];
              return (
                <Link 
                  key={item.href} href={item.href} 
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '11px 14px', borderRadius: 16, textDecoration: 'none',
                    background: active ? c.bg : 'transparent',
                    color: active ? c.fg : 'var(--text-primary)',
                    fontWeight: active ? 600 : 500, fontSize: 15,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: active ? c.fg : c.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                    <item.icon size={18} style={{ color: active ? 'white' : c.fg }} />
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div style={{ padding: '12px 12px 20px', borderTop: '1px solid var(--border)' }}>
            <button 
              onClick={handleToggleTheme}
              style={{ 
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '11px 14px', borderRadius: 16, border: 'none', cursor: 'pointer',
                background: 'var(--surface-raised)', color: 'var(--text-primary)',
                fontSize: 15, fontWeight: 500, fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: theme === 'dark' ? 'rgba(251,191,36,0.15)' : 'rgba(139,92,246,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {theme === 'light' ? <IconMoon size={18} style={{ color: 'var(--violet)' }} /> : <IconSun size={18} style={{ color: 'var(--amber)' }} />}
              </div>
              <span>{theme === 'light' ? 'โหมดมืด' : 'โหมดสว่าง'}</span>
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
