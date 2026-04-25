'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTodos } from '@/lib/hooks/useTodos';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MobileNav from '@/components/layout/MobileNav';
import { useState, useEffect } from 'react';

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/': { title: 'Dashboard', subtitle: 'ภาพรวมวันนี้' },
  '/todo': { title: 'To-Do List', subtitle: 'จัดการงานที่ต้องทำ' },
  '/schedule': { title: 'ตารางเรียน', subtitle: 'ตารางเรียนประจำสัปดาห์' },
  '/auto-schedule': { title: 'Auto Schedule', subtitle: 'AI จัดตารางอัจฉริยะ' },
  '/notes': { title: 'Notes', subtitle: 'จดบันทึกของคุณ' },
  '/drive': { title: 'Google Drive', subtitle: 'เชื่อมต่อและให้ AI อ่านเอกสาร' },
  '/knowledge-graph': { title: 'Knowledge Graph', subtitle: 'เครือข่ายความรู้ 3D' },
  '/canvas': { title: 'Deep Work Canvas', subtitle: 'พื้นที่ทำงานแบบ Infinite Canvas' },
  '/pomodoro': { title: 'Focus Timer', subtitle: 'เทคนิค Pomodoro เพื่อการเรียน' },
  '/voice-tutor': { title: 'Voice Tutor', subtitle: 'ติวเตอร์ AI พูดคุยได้' },
  '/ai-tools': { title: 'AI Tools & Links', subtitle: 'เครื่องมือ AI และลิงก์ที่มีประโยชน์' },
  '/ai': { title: 'AI Assistant', subtitle: 'Study AI พร้อมช่วยเหลือคุณ' },
  '/settings': { title: 'ตั้งค่า', subtitle: 'ตั้งค่าบัญชีและแอปพลิเคชัน' },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLocalMode, loading } = useAuth();
  const { todos } = useTodos();
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

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: 'var(--text-primary)', marginBottom: 8 }}>
            Study<span style={{ color: 'var(--orange)' }}>OS</span>
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-hint)' }}>กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!user && !isLocalMode) return null;

  const basePathname = '/' + (pathname.split('/')[1] || '');
  const pageInfo = pageTitles[basePathname] || pageTitles[pathname] || { title: 'Study OS' };

  return (
    <div className="app-layout" data-is-mobile={isMobile}>
      {/* Force Mobile Styles Nuke Option */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .main-area { margin-left: 0 !important; width: 100% !important; flex: 1 !important; }
          .app-layout { display: block !important; }
        }
      ` }} />

      {/* Mobile Warning Banner */}
      {isMobile && (
        <div style={{ 
          background: 'var(--orange-light)', color: 'var(--orange)', 
          padding: '8px 16px', fontSize: 12, textAlign: 'center',
          display: 'flex', justifyContent: 'center', alignItems: 'center', 
          fontWeight: 600, borderBottom: '1px solid var(--orange)',
          position: 'sticky', top: 0, zIndex: 100
        }}>
          ⚠️ ฟีเจอร์ในมือถืออาจไม่ครบถ้วน กรุณาเปิดบน Desktop PC เพื่อประสบการณ์ที่ดีที่สุด
        </div>
      )}

      <Sidebar />
      
      <div className="main-area">
        <Topbar title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <main className="page-content">
          {children}
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
}
