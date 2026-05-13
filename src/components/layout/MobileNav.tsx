'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconHome, 
  IconCheckSquare, 
  IconFileText, 
  IconMessageCircle, 
  IconPlus,
  IconCalendar,
  IconSettings,
  IconSparkles,
  IconCamera
} from '@/components/ui/Icons';

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showSheet, setShowSheet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const basePath = pathname.startsWith('/app') ? '/app' : '';

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === basePath) return pathname === basePath;
    return pathname.startsWith(path);
  };

  if (!isMobile) return null;

  // Dynamic values based on scroll
  const navHeight = isScrolled ? 54 : 70;
  const navWidth = isScrolled ? '80%' : 'calc(100% - 40px)';
  const navBottom = isScrolled ? 20 : 24;
  const iconSize = isScrolled ? 20 : 24;
  const fabScale = isScrolled ? 0.85 : 1;
  const fabMargin = isScrolled ? -15 : -34;

  const springConfig = { type: "spring" as const, stiffness: 400, damping: 30 };

  return (
    <>
      {/* Backdrop for FAB Menu */}
      <AnimatePresence>
        {showSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSheet(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(8px)',
              zIndex: 90,
            }}
          />
        )}
      </AnimatePresence>

      {/* FAB Action Menu */}
      <AnimatePresence>
        {showSheet && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fab-sheet"
            style={{ bottom: isScrolled ? 84 : 90 }}
          >
            <button className="fab-sheet-item" onClick={() => { router.push(`${basePath}/schedule`); setShowSheet(false); }}>
              <IconCalendar size={18} style={{ color: 'var(--accent)' }} />
              <span>ตารางเรียน</span>
            </button>
            <button className="fab-sheet-item" onClick={() => { router.push(`${basePath}/ai-tools`); setShowSheet(false); }}>
              <IconSparkles size={18} style={{ color: 'var(--violet)' }} />
              <span>เครื่องมือ AI</span>
            </button>
            <button className="fab-sheet-item" onClick={() => { router.push(`${basePath}/scan`); setShowSheet(false); }}>
              <IconCamera size={18} style={{ color: 'var(--rose)' }} />
              <span>สแกนโน้ต (AI)</span>
            </button>
            <button className="fab-sheet-item" onClick={() => { router.push(`${basePath}/settings`); setShowSheet(false); }}>
              <IconSettings size={18} style={{ color: 'var(--text-secondary)' }} />
              <span>ตั้งค่า</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation — Responsive Capsule */}
      <motion.nav 
        initial={false}
        animate={{ 
          height: navHeight,
          width: navWidth,
          bottom: navBottom,
          borderRadius: navHeight / 2,
          x: "-50%"
        }}
        transition={springConfig}
        className="fixed left-1/2 z-50 flex items-center justify-around px-2"
        style={{ 
          background: isScrolled 
            ? 'color-mix(in srgb, var(--surface-card) 60%, transparent)'
            : 'color-mix(in srgb, var(--surface-card) 20%, transparent)',
          backdropFilter: 'blur(60px) saturate(300%)', 
          WebkitBackdropFilter: 'blur(60px) saturate(300%)', 
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: isScrolled
            ? '0 12px 30px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.1)'
            : '0 20px 40px rgba(0,0,0,0.25), 0 4px 10px rgba(0,0,0,0.1), inset 0 2px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <Link href={basePath} className={`mobile-nav-item ${isActive(basePath) ? 'active' : ''}`}>
          <motion.div whileTap={{ scale: 0.8 }} className="flex flex-col items-center">
            <motion.div animate={{ scale: iconSize / 24 }} transition={springConfig}>
              <IconHome size={24} />
            </motion.div>
            {isActive(basePath) && <motion.span layoutId="nav-dot" className="nav-active-dot" style={{ marginTop: isScrolled ? 0 : 2 }} />}
          </motion.div>
        </Link>

        <Link href={`${basePath}/todo`} className={`mobile-nav-item ${isActive(`${basePath}/todo`) ? 'active' : ''}`}>
          <motion.div whileTap={{ scale: 0.8 }} className="flex flex-col items-center">
            <motion.div animate={{ scale: iconSize / 24 }} transition={springConfig}>
              <IconCheckSquare size={24} />
            </motion.div>
            {isActive(`${basePath}/todo`) && <motion.span layoutId="nav-dot" className="nav-active-dot" style={{ marginTop: isScrolled ? 0 : 2 }} />}
          </motion.div>
        </Link>

        {/* Center FAB */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.85 }}
            animate={{ 
              scale: fabScale,
              marginTop: fabMargin
            }}
            transition={springConfig}
            className="fab"
            onClick={() => setShowSheet(!showSheet)}
          >
            <motion.div animate={{ rotate: showSheet ? 45 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <IconPlus size={26} />
            </motion.div>
          </motion.button>
        </div>

        <Link href={`${basePath}/notes`} className={`mobile-nav-item ${isActive(`${basePath}/notes`) ? 'active' : ''}`}>
          <motion.div whileTap={{ scale: 0.8 }} className="flex flex-col items-center">
            <motion.div animate={{ scale: iconSize / 24 }} transition={springConfig}>
              <IconFileText size={24} />
            </motion.div>
            {isActive(`${basePath}/notes`) && <motion.span layoutId="nav-dot" className="nav-active-dot" style={{ marginTop: isScrolled ? 0 : 2 }} />}
          </motion.div>
        </Link>

        <Link href={`${basePath}/ai`} className={`mobile-nav-item ${isActive(`${basePath}/ai`) ? 'active' : ''}`}>
          <motion.div whileTap={{ scale: 0.8 }} className="flex flex-col items-center">
            <motion.div animate={{ scale: iconSize / 24 }} transition={springConfig}>
              <IconMessageCircle size={24} />
            </motion.div>
            {isActive(`${basePath}/ai`) && <motion.span layoutId="nav-dot" className="nav-active-dot" style={{ marginTop: isScrolled ? 0 : 2 }} />}
          </motion.div>
        </Link>
      </motion.nav>
    </>
  );
}
