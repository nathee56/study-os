'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTodos } from '@/lib/hooks/useTodos';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MobileNav from '@/components/layout/MobileNav';

import PWAPrompt from '@/components/ui/PWAPrompt';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/': { title: 'Dashboard', subtitle: 'ภาพรวมวันนี้' },
  '/todo': { title: 'To-Do List', subtitle: 'จัดการงานที่ต้องทำ' },
  '/schedule': { title: 'ตารางเรียน', subtitle: 'ตารางเรียนประจำสัปดาห์' },
  '/notes': { title: 'Notes', subtitle: 'จดบันทึกของคุณ' },
  '/drive': { title: 'Google Drive', subtitle: 'เชื่อมต่อและให้ AI อ่านเอกสาร' },
  '/ai-tools': { title: 'AI Tools & Links', subtitle: 'เครื่องมือ AI และลิงก์ที่มีประโยชน์' },
  '/ai': { title: 'AI Assistant', subtitle: 'Study AI พร้อมช่วยเหลือคุณ' },
  '/pomodoro': { title: 'Pomodoro', subtitle: 'โหมดจดจ่อกับการเรียน' },
  '/settings': { title: 'ตั้งค่า', subtitle: 'ตั้งค่าบัญชีและแอปพลิเคชัน' },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLocalMode, loading } = useAuth();
  const { todos } = useTodos();
  const { needsOnboarding, loading: onboardingLoading } = useOnboarding();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  // Check if we're on the AI page (mobile full-page mode)
  const isAIPage = pathname === '/app/ai';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Splash screen — mobile only, once per session
  useEffect(() => {
    if (isMobile && typeof window !== 'undefined') {
      const splashShown = sessionStorage.getItem('splash_shown');
      if (!splashShown) {
        setShowSplash(true);
        sessionStorage.setItem('splash_shown', '1');
        const timer = setTimeout(() => setShowSplash(false), 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [isMobile]);

  useEffect(() => {
    if (!loading && !user && !isLocalMode) {
      router.push('/login');
    }
  }, [user, isLocalMode, loading, router]);

  // Onboarding redirect
  useEffect(() => {
    if (!loading && !onboardingLoading && needsOnboarding && (user || isLocalMode)) {
      router.push('/onboarding');
    }
  }, [loading, onboardingLoading, needsOnboarding, user, isLocalMode, router]);

  if (loading || onboardingLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <img src="/logo.png" alt="JamDai" style={{ height: 160, width: 'auto', maxWidth: '80vw', objectFit: 'contain' }} />
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-hint)' }}>กำลังโหลด...</p>
          {/* PWA Prompt */}
          <PWAPrompt />
        </div>
      </div>
    );
  }

  if (!user && !isLocalMode) return null;
  if (needsOnboarding) return null;

  let key = pathname.replace(/^\/app/, '');
  if (key === '') key = '/';
  
  const basePathname = '/' + (key.split('/')[1] || '');
  const pageInfo = pageTitles[basePathname] || pageTitles[key] || { title: 'JamDai' };

  // Hide topbar and navbar on AI page (mobile only)
  const hideNavForAI = isMobile && isAIPage;

  return (
    <>
      {/* Splash Screen — mobile only, once per session */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'fixed', inset: 0, zIndex: 99999,
              background: 'var(--surface-base)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 16,
            }}
          >
            <motion.img
              src="/logo.png"
              alt="JamDai"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: 120, width: 'auto', objectFit: 'contain' }}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.5px' }}
            >
              Productivity Workspace
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="app-layout"
        data-is-mobile={isMobile}
        style={hideNavForAI ? { '--mobile-bottom-space': '0px' } as React.CSSProperties : undefined}
      >
        {/* Mobile overrides are handled in globals.css */}

        <Sidebar />
        
        <div className="main-area">
          {!hideNavForAI && <Topbar title={pageInfo.title} subtitle={pageInfo.subtitle} />}
          <main
            className={`page-content ${isMobile ? 'scroll-fade-mask' : ''}`}
            style={hideNavForAI ? { paddingTop: '0px', paddingBottom: '0px', overflow: 'hidden' } : undefined}
          >
            <div key={pathname} className="animate-in-fade w-full">
              {children}
            </div>
          </main>
        </div>
        
        {!hideNavForAI && <MobileNav />}
        <PWAPrompt />
      </div>
    </>
  );
}
