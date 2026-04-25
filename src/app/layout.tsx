import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";

const sarabun = Sarabun({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  display: 'swap',
  variable: '--font-sarabun',
});

export const metadata: Metadata = {
  title: "Study OS — Productivity Workspace",
  description: "Study OS เป็น productivity workspace ส่วนตัวสำหรับนักศึกษามหาวิทยาลัยราชภัฏนครสวรรค์ โดยมี AI ภาษาไทย เป็นศูนย์กลาง",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={sarabun.variable}>
        {children}
      </body>
    </html>
  );
}
