import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// แก้ไขชื่อและคำอธิบายเว็บไซต์
export const metadata: Metadata = {
  title: "Xiumei 秀美 POS",
  description: "ระบบจัดการร้าน Xiumei 秀美",
};

// แก้ไข Type ของ children ให้ถูกต้องตามมาตรฐาน Next.js
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th" // เปลี่ยนเป็นภาษาไทย
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* ใส่ Toaster ไว้ด้านบนสุดของ body */}
        <Toaster position="top-center" reverseOrder={false} />
        {children}
      </body>
    </html>
  );
}