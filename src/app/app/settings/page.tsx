'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  IconArrowLeft,
  IconUser,
  IconBell,
  IconShield,
  IconMoon,
  IconSun,
  IconChevronRight,
  IconLogOut,
  IconCloud,
  IconDatabase,
  IconInfo,
  IconSmartphone,
  IconGlobe,
  IconCreditCard
} from '@/components/ui/Icons';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { user, signOut, isLocalMode, loginLocalMode } = useAuth();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px 100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button onClick={() => router.back()} className="btn-icon" style={{ background: 'var(--surface-card)', borderRadius: 12 }}>
          <IconArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>ตั้งค่า</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>จัดการบัญชีและความเป็นส่วนตัวของคุณ</p>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
      >
        {/* Profile Section */}
        <section>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12, marginLeft: 4 }}>บัญชีผู้ใช้</h2>
          <div className="settings-group" style={{ background: 'var(--surface-card)', borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 20, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <IconUser size={24} style={{ color: 'var(--accent)' }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{user?.displayName || (isLocalMode ? 'Local User' : 'Guest')}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user?.email || (isLocalMode ? 'โหมดใช้งานแบบออฟไลน์' : 'ไม่ได้เข้าสู่ระบบ')}</p>
              </div>
              {isLocalMode && (
                <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 10 }}>ซิงค์ข้อมูล</button>
              )}
            </div>
            
            <SettingsItem 
              icon={<IconShield size={20} />} 
              label="ความปลอดภัยและรหัสผ่าน" 
              sublabel="จัดการข้อมูลความปลอดภัยของคุณ"
              variants={itemVariants}
            />
          </div>
        </section>

        {/* Preferences Section */}
        <section>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12, marginLeft: 4 }}>ความชอบส่วนตัว</h2>
          <div className="settings-group" style={{ background: 'var(--surface-card)', borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                {isDarkMode ? <IconMoon size={20} /> : <IconSun size={20} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>โหมดมืด (Dark Mode)</div>
              </div>
              <div 
                onClick={() => setIsDarkMode(!isDarkMode)}
                style={{ 
                  width: 48, height: 26, borderRadius: 13, 
                  background: isDarkMode ? 'var(--accent)' : 'var(--border)',
                  position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease'
                }}
              >
                <div style={{ 
                  width: 20, height: 20, borderRadius: '50%', background: 'white',
                  position: 'absolute', top: 3, left: isDarkMode ? 25 : 3,
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} />
              </div>
            </div>
            
            <SettingsItem 
              icon={<IconBell size={20} />} 
              label="การแจ้งเตือน" 
              sublabel="จัดการข้อความแจ้งเตือนทั้งหมด"
              variants={itemVariants}
            />
            <SettingsItem 
              icon={<IconGlobe size={20} />} 
              label="ภาษา (Language)" 
              sublabel="ไทย (Thai)"
              variants={itemVariants}
            />
          </div>
        </section>

        {/* Data & Storage */}
        <section>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12, marginLeft: 4 }}>ข้อมูลและพื้นที่เก็บข้อมูล</h2>
          <div className="settings-group" style={{ background: 'var(--surface-card)', borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <SettingsItem 
              icon={<IconCloud size={20} />} 
              label="Cloud Sync" 
              sublabel={user ? 'เชื่อมต่อแล้ว' : 'เข้าสู่ระบบเพื่อใช้งาน'}
              variants={itemVariants}
            />
            <SettingsItem 
              icon={<IconDatabase size={20} />} 
              label="จัดการข้อมูลในเครื่อง" 
              sublabel="สำรองข้อมูลหรือล้างข้อมูลทั้งหมด"
              variants={itemVariants}
            />
          </div>
        </section>

        {/* App Info */}
        <section>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12, marginLeft: 4 }}>เกี่ยวกับ</h2>
          <div className="settings-group" style={{ background: 'var(--surface-card)', borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <SettingsItem 
              icon={<IconInfo size={20} />} 
              label="เกี่ยวกับ Study OS" 
              sublabel="เวอร์ชัน 3.0.0 (Beta)"
              variants={itemVariants}
            />
            <SettingsItem 
              icon={<IconSmartphone size={20} />} 
              label="ช่วยเหลือและสนับสนุน" 
              variants={itemVariants}
            />
          </div>
        </section>

        {/* Logout Button */}
        <div style={{ marginTop: 8 }}>
          <button 
            onClick={() => signOut()}
            className="btn-ghost" 
            style={{ 
              width: '100%', height: 56, borderRadius: 20, 
              color: '#ff4b4b', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', gap: 10, fontWeight: 700,
              background: 'rgba(255, 75, 75, 0.05)',
              border: '1px solid rgba(255, 75, 75, 0.1)'
            }}
          >
            <IconLogOut size={20} />
            ออกจากระบบ
          </button>
        </div>
        
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          Study OS © 2024 • Created with ❤️ by JamDai Team
        </p>
      </motion.div>
    </div>
  );
}

function SettingsItem({ icon, label, sublabel, variants }: { icon: React.ReactNode, label: string, sublabel?: string, variants?: any }) {
  return (
    <motion.div 
      variants={variants}
      whileTap={{ backgroundColor: 'var(--surface-raised)' }}
      style={{ 
        padding: '16px 20px', display: 'flex', alignItems: 'center', 
        gap: 16, cursor: 'pointer', transition: 'all 0.2s ease',
        borderBottom: '1px solid var(--border)'
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        {sublabel && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sublabel}</div>}
      </div>
      <IconChevronRight size={18} style={{ color: 'var(--text-hint)' }} />
    </motion.div>
  );
}
