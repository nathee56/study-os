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
  title: "JamDai — Productivity Workspace",
  description: "JamDai เป็น productivity workspace ส่วนตัวสำหรับนักศึกษา โดยมี AI ภาษาไทย เป็นศูนย์กลาง",
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E8651A" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${sarabun.variable}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
