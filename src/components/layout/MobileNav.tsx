'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  IconHome, IconCheckSquare, IconCalendar, IconMessageCircle, IconPlus, IconFileText, IconCloud, IconClock, IconLayout, IconMicrophone
} from '@/components/ui/Icons';

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showSheet, setShowSheet] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* FAB Action Sheet */}
      {showSheet && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 55 }} onClick={() => setShowSheet(false)}>
          <div className={`fab-sheet ${showSheet ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
            <button className="fab-sheet-item" onClick={() => { router.push('/canvas'); setShowSheet(false); }}>
              <IconLayout size={18} style={{ color: '#886FBF' }} />
              <span>Deep Work Canvas</span>
            </button>
            <button className="fab-sheet-item" onClick={() => { router.push('/pomodoro'); setShowSheet(false); }}>
              <IconClock size={18} style={{ color: 'var(--orange)' }} />
              <span>Focus Timer</span>
            </button>
            <button className="fab-sheet-item" onClick={() => { router.push('/drive'); setShowSheet(false); }}>
              <IconCloud size={18} style={{ color: '#4285F4' }} />
              <span>Google Drive</span>
            </button>
            <button className="fab-sheet-item" onClick={() => { router.push('/notes?new=1'); setShowSheet(false); }}>
              <IconFileText size={18} />
              <span>เพิ่มโน้ต</span>
            </button>
            <button className="fab-sheet-item" onClick={() => { router.push('/todo?new=1'); setShowSheet(false); }}>
              <IconCheckSquare size={18} />
              <span>เพิ่ม To-Do</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="mobile-nav" style={{ padding: '0 16px' }}>
        <Link href="/" className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`}>
          <IconHome size={24} />
        </Link>
        <Link href="/todo" className={`mobile-nav-item ${isActive('/todo') ? 'active' : ''}`}>
          <IconCheckSquare size={24} />
        </Link>
        
        <button className="fab" onClick={() => setShowSheet(!showSheet)} style={{ transform: 'translateY(-16px)', width: 56, height: 56 }}>
          <IconPlus size={28} style={{ transform: showSheet ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
        
        <Link href="/voice-tutor" className={`mobile-nav-item ${isActive('/voice-tutor') ? 'active' : ''}`}>
          <IconMicrophone size={24} />
        </Link>
        <Link href="/ai" className={`mobile-nav-item ${isActive('/ai') ? 'active' : ''}`}>
          <IconMessageCircle size={24} />
        </Link>
      </nav>
    </>
  );
}
