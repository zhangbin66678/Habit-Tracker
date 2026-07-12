"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) { setError("请填写用户名和密码"); return; }
    setLoading(true);
    const err = await login(username.trim(), password);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold mb-4">H</div>
          <h1 className="text-2xl font-bold text-gray-900">Habit Tracker</h1>
          <p className="text-gray-500 mt-1">登录你的账户，开始今日打卡</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">用户名</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="请输入用户名"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="请输入密码"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? "登录中..." : "登 录"}
          </button>
          <p className="text-center text-sm text-gray-500">
            还没有账户？ <Link href="/register" className="text-blue-600 font-medium hover:underline">立即注册</Link>
          </p>
        </form>
      </div>
    </div>
  );
}