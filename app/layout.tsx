import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
