// Changelog data - ข้อมูลการอัปเดตทั้งหมดของ JamDai
// *** ทุกครั้งที่มีการอัปเดตฟีเจอร์ใหม่ ต้องเพิ่มข้อมูลที่นี่เสมอ ***

export interface ChangelogEntry {
  version: string;
  date: string; // YYYY-MM-DD
  title: string;
  highlights: {
    emoji: string;
    title: string;
    description: string;
  }[];
}

export const CURRENT_VERSION = '2.1.0';

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '2.1.0',
    date: '2026-05-10',
    title: 'AI ฉลาดขึ้น + แจ้งเตือนอัจฉริยะ',
    highlights: [
      {
        emoji: '🧠',
        title: 'AI Memory System',
        description: 'AI จดจำข้อมูลส่วนตัวของคุณจากการสนทนา ทำให้ตอบได้ตรงใจมากขึ้น จัดการความจำได้ในหน้าตั้งค่า',
      },
      {
        emoji: '⚡',
        title: 'AI Proactive Alert',
        description: 'การ์ดเตือนอัจฉริยะบนหน้า Dashboard วิเคราะห์งานค้างและตารางเรียนเพื่อเตือนคุณโดยอัตโนมัติ',
      },
      {
        emoji: '🔔',
        title: 'Push Notification',
        description: 'รับแจ้งเตือนสรุปตารางเรียนและงานค้างทุกเช้า 8 โมง แม้ไม่ได้เปิดแอปค้างไว้! เปิดใช้งานได้ในตั้งค่า',
      },
      {
        emoji: '✨',
        title: 'Rebranding เป็น JamDai AI',
        description: 'เปลี่ยนชื่อผู้ช่วย AI จาก "Study AI" เป็น "JamDai AI" เพื่อความเป็นแบรนด์ที่ชัดเจน',
      },
    ],
  },
  {
    version: '2.0.0',
    date: '2026-05-09',
    title: 'JamDai v2 — ปรับโฉมครั้งใหญ่',
    highlights: [
      {
        emoji: '🎨',
        title: 'ดีไซน์ Premium ใหม่ทั้งหมด',
        description: 'ธีมสีใหม่ Glassmorphism, Gradient สวยงาม, Dark Mode สมบูรณ์แบบ',
      },
      {
        emoji: '📱',
        title: 'PWA เต็มรูปแบบ',
        description: 'ติดตั้งเป็นแอปลงมือถือได้ ใช้งานออฟไลน์ได้ พร้อมระบบ PIN Lock',
      },
      {
        emoji: '🤖',
        title: 'AI Chat หลายรุ่น',
        description: 'เลือกใช้ AI ได้ 4 รุ่น: OpenThaiGPT, Pathumma, Typhoon, Thalle',
      },
      {
        emoji: '🔐',
        title: 'Local Mode',
        description: 'ใช้งานได้โดยไม่ต้องล็อกอิน ข้อมูลเก็บในเครื่องอย่างปลอดภัย',
      },
    ],
  },
];
