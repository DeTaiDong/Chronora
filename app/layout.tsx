import type { Metadata } from "next";
import { Ma_Shan_Zheng, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const maShanZheng = Ma_Shan_Zheng({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ma-shan-zheng",
  display: "swap",
  preload: false
});

const notoSerifSC = Noto_Serif_SC({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-noto-serif-sc",
  display: "swap",
  preload: false
});

export const metadata: Metadata = {
  title: "观石 Chronora",
  description: "观石 Chronora：东方术数问诊与八字排盘工具。",
  icons: {
    icon: "/icon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${maShanZheng.variable} ${notoSerifSC.variable}`}>
      <body>{children}</body>
    </html>
  );
}
