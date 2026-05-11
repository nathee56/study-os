'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTodos } from '@/lib/hooks/useTodos';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MobileNav from '@/components/layout/MobileNav';
import LockScreen from '@/components/lock/LockScreen';
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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  let key = pathname.replace(/^\/(dashboard|app)/, '');
  if (key === '') key = '/';
  
  const basePathname = '/' + (key.split('/')[1] || '');
  const pageInfo = pageTitles[basePathname] || pageTitles[key] || { title: 'JamDai' };

  return (
    <LockScreen>
    <div className="app-layout" data-is-mobile={isMobile}>
      {/* 
        CRITICAL UI FIX: This ensures mobile layout is forced correctly 
        even if CSS bundle is cached or has specificity issues.
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media screen and (max-width: 768px) {
          .sidebar { display: none !important; }
          .main-area { 
            margin-left: 0 !important; 
            padding-left: 0 !important;
            width: 100vw !important;
            flex: 1 !important;
          }
          .app-layout { 
            display: flex !important; 
            flex-direction: column !important;
          }
          .page-content {
            width: 100% !important;
            max-width: 100vw !important;
            padding: 16px !important;
          }
        }
      ` }} />


      <Sidebar />
      
      <div className="main-area">
        <Topbar title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <main className="page-content">
          <AnimatePresence>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      <MobileNav />
      <PWAPrompt />
    </div>
    </LockScreen>
  );
}
