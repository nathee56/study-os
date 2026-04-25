'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/lib/hooks/useTheme';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTodos } from '@/lib/hooks/useTodos';
import { 
  IconSun, IconMoon, IconPlus, IconCheckSquare, IconMenu, IconX, 
  IconCalendar, IconFileText, IconCpu, IconBrain, IconTarget, IconLayout, IconSettings
} from '@/components/ui/Icons';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { todos } = useTodos();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const totalTodos = todos.length;
  const doneTodos = todos.filter(t => t.done).length;
  const progress = totalTodos === 0 ? 0 : Math.round((doneTodos / totalTodos) * 100);

  const menuItems = [
    { href: '/schedule', label: 'ตารางเรียน', icon: IconCalendar },
    { href: '/auto-schedule', label: 'Auto Schedule', icon: IconTarget },
    { href: '/notes', label: 'โน๊ตทั้งหมด', icon: IconFileText },
    { href: '/knowledge-graph', label: 'Knowledge Graph', icon: IconBrain },
    { href: '/canvas', label: 'Deep Work Canvas', icon: IconLayout },
    { href: '/ai-tools', label: 'AI Tools', icon: IconCpu },
    { href: '/settings', label: 'ตั้งค่า', icon: IconSettings },
  ];

  return (
    <>
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isMobile && (
          <button className="btn-icon" onClick={() => setIsMenuOpen(true)}>
            <IconMenu size={24} />
          </button>
        )}
        <div>
          <h1 style={{ fontSize: 20, fontFamily: 'Georgia, serif' }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: 'var(--text-hint)', marginTop: 1 }}>{subtitle}</p>
        )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        
        {/* Daily Progress */}
        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border)' }}>
          <IconCheckSquare size={14} style={{ color: progress === 100 ? 'var(--success)' : 'var(--text-hint)' }} />
          <div style={{ width: 60, height: 4, background: 'var(--cream3)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? 'var(--success)' : 'var(--orange)', transition: 'width 0.3s ease' }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{progress}%</span>
        </div>

        {/* Quick Add Button */}
        <button className="btn-primary desktop-only" onClick={() => router.push('/notes?new=1')} style={{ padding: '6px 12px', fontSize: 12, borderRadius: 20, gap: 4 }}>
          <IconPlus size={14} /> โน้ตด่วน
        </button>

        <div style={{ width: 1, height: 20, background: 'var(--border)' }} className="desktop-only" />

        <button className="btn-icon" onClick={toggleTheme} title="สลับธีม">
          {theme === 'light' ? <IconMoon size={18} /> : <IconSun size={18} />}
        </button>
        
        {user && (
          <div style={{
            width: 34, height: 34, borderRadius: '50%', overflow: 'hidden',
            background: 'var(--cream3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {user.displayName?.charAt(0) || 'U'}
              </span>
            )}
          </div>
        )}
      </div>
    </header>

    {/* Mobile Hamburger Menu Overlay */}
    {isMenuOpen && (
      <div className="mobile-only" style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setIsMenuOpen(false)} />
        <div style={{ 
          position: 'absolute', top: 0, bottom: 0, left: 0, width: '280px', 
          background: 'var(--bg)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', animation: 'slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ padding: '24px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: 'var(--text-primary)' }}>
                Study<span style={{ color: 'var(--orange)' }}>OS</span>
              </h2>
            </div>
            <button className="btn-icon" onClick={() => setIsMenuOpen(false)}>
              <IconX size={20} />
            </button>
          </div>
          
          <nav style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
            {menuItems.map(item => {
              const active = pathname.startsWith(item.href);
              return (
                <Link 
                  key={item.href} href={item.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className={`nav-item ${active ? 'active' : ''}`}
                  style={{ marginBottom: 4, padding: '12px 16px', borderRadius: 12 }}
                >
                  <item.icon size={20} />
                  <span style={{ fontSize: 15 }}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    )}
    </>
  );
}
