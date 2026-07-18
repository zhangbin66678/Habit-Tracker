"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/", label: "今日打卡", icon: "✅", desc: "完成每日习惯" },
  { href: "/agent", label: "智能规划", icon: "🧠", desc: "AI 生成日程" },
  { href: "/history", label: "历史记录", icon: "📅", desc: "查看打卡详情" },
  { href: "/stats", label: "数据统计", icon: "📊", desc: "分析习惯趋势" },
  { href: "/manage", label: "习惯管理", icon: "⚙️", desc: "添加编辑习惯" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">H</div>
        <div>
          <h1 className="font-bold text-gray-900 text-sm leading-tight">Habit Tracker</h1>
          <p className="text-xs text-gray-400">习惯打卡管理系统</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-lg w-6 text-center">{item.icon}</span>
              <div className="flex-1">
                <div>{item.label}</div>
                <div className={`text-xs font-normal ${isActive ? "text-blue-400" : "text-gray-400"}`}>{item.desc}</div>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{user.username}</p>
            <p className="text-xs text-gray-400">已登录</p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="退出登录"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}