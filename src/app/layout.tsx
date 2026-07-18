import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ConfirmProvider } from "@/contexts/ConfirmContext";
import AuthGuard from "@/components/AuthGuard";
import AIFloatingAssistant from "@/components/AIFloatingAssistant";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Habit Tracker - 每日习惯打卡",
  description: "基于AI辅助编程的习惯打卡管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        <AuthProvider>
          <ToastProvider>
            <ConfirmProvider>
              <AuthGuard>
                {children}
                <AIFloatingAssistant />
              </AuthGuard>
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}