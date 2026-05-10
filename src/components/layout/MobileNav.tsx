'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  IconHome, IconCheckSquare, IconCalendar, IconMessageCircle, IconPlus, IconFileText, IconClock
} from '@/components/ui/Icons';

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showSheet, setShowSheet] = useState(false);

  const isLocalMode = typeof window !== 'undefined' && localStorage.getItem('studyos_local_mode') === 'true';
  const isNU = !isLocalMode && pathname.startsWith('/dashboard');
  const basePath = isNU ? '/dashboard' : '/app';

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* FAB Action Sheet Backdrop */}
      {showSheet && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 55, background: 'rgba(0,0,0,0.3)' }} onClick={() => setShowSheet(false)}>
          <div className="fab-sheet open" onClick={(e) => e.stopPropagation()}>
            <button className="fab-sheet-item" onClick={() => { router.push(`${basePath}/todo?new=1`); setShowSheet(false); }}>
              <IconCheckSquare size={18} style={{ color: 'var(--accent)' }} />
              <span>เพิ่ม To-Do</span>
            </button>
            <button className="fab-sheet-item" onClick={() => { router.push(`${basePath}/notes?new=1`); setShowSheet(false); }}>
              <IconFileText size={18} style={{ color: 'var(--accent)' }} />
              <span>สร้างโน้ต</span>
            </button>
            <button className="fab-sheet-item" onClick={() => { router.push(`${basePath}/pomodoro`); setShowSheet(false); }}>
              <IconClock size={18} style={{ color: 'var(--orange)' }} />
              <span>โฟกัส / Pomodoro</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation — 4 tabs + center FAB */}
      <nav className="mobile-nav">
        <Link href={basePath} className={`mobile-nav-item ${isActive(basePath) ? 'active' : ''}`}>
          <IconHome size={24} />
          {isActive(basePath) && <span className="nav-active-dot" />}
        </Link>

        <Link href={`${basePath}/todo`} className={`mobile-nav-item ${isActive(`${basePath}/todo`) ? 'active' : ''}`}>
          <IconCheckSquare size={24} />
          {isActive(`${basePath}/todo`) && <span className="nav-active-dot" />}
        </Link>

        <button
          className="fab"
          onClick={() => setShowSheet(!showSheet)}
        >
          <IconPlus size={26} style={{ transform: showSheet ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {isNU ? (
          <Link href={`${basePath}/schedule`} className={`mobile-nav-item ${isActive(`${basePath}/schedule`) ? 'active' : ''}`}>
            <IconCalendar size={24} />
            {isActive(`${basePath}/schedule`) && <span className="nav-active-dot" />}
          </Link>
        ) : (
          <Link href={`${basePath}/notes`} className={`mobile-nav-item ${isActive(`${basePath}/notes`) ? 'active' : ''}`}>
            <IconFileText size={24} />
            {isActive(`${basePath}/notes`) && <span className="nav-active-dot" />}
          </Link>
        )}

        <Link href={`${basePath}/ai`} className={`mobile-nav-item ${isActive(`${basePath}/ai`) ? 'active' : ''}`}>
          <IconMessageCircle size={24} />
          {isActive(`${basePath}/ai`) && <span className="nav-active-dot" />}
        </Link>
      </nav>
    </>
  );
}
