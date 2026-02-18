import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "拼豆图纸生成器 - 一键生成 Artkal 拼豆图纸",
  description: "上传照片，自动转换为像素风拼豆图纸，支持 Artkal C 系列 159 色。带色号标注的网格图纸 + 用料清单，方便打印制作。",
  keywords: "拼豆,图纸,Artkal,像素画,手工,DIY,拼豆图纸生成器",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
