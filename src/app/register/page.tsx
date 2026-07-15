"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

function validatePassword(pwd: string): string | null {
  if (pwd.length < 8) return "密码至少8个字符";
  if (!/[a-zA-Z]/.test(pwd)) return "密码需包含至少一个字母";
  if (!/[0-9]/.test(pwd)) return "密码需包含至少一个数字";
  return null;
}

const strengthLabel = (pwd: string): { text: string; color: string } => {
  if (pwd.length === 0) return { text: "", color: "" };
  if (pwd.length < 6) return { text: "弱", color: "bg-red-400" };
  if (pwd.length < 8) return { text: "较弱", color: "bg-orange-400" };
  if (!/[a-zA-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { text: "中等", color: "bg-yellow-400" };
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) return { text: "强", color: "bg-green-500" };
  return { text: "较强", color: "bg-green-400" };
};

export default function RegisterPage() {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password || !confirm) { setError("请填写所有字段"); return; }
    if (username.trim().length < 2) { setError("用户名至少2个字符"); return; }
    const pwdErr = validatePassword(password);
    if (pwdErr) { setError(pwdErr); return; }
    if (password !== confirm) { setError("两次密码不一致"); return; }
    setLoading(true);
    const err = await register(username.trim(), password);
    if (err) setError(err);
    setLoading(false);
  };

  const strength = strengthLabel(password);
  const pwdErr = password ? validatePassword(password) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white text-2xl font-bold mb-4">H</div>
          <h1 className="text-2xl font-bold text-gray-900">Habit Tracker</h1>
          <p className="text-gray-500 mt-1">创建新账户，开启习惯养成之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">用户名</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="2-30个字符" maxLength={30}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="至少8位，需包含字母和数字"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm" />
            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  <div className={`h-1.5 flex-1 rounded-full ${strength.color}`} />
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">密码强度：{strength.text}</span>
                  {pwdErr && <span className="text-xs text-red-400">{pwdErr}</span>}
                </div>
              </div>
            )}
            <div className="mt-1.5 space-y-0.5">
              <p className={`text-xs ${password.length >= 8 ? "text-green-500" : "text-gray-300"}`}>至少8个字符</p>
              <p className={`text-xs ${/[a-zA-Z]/.test(password) ? "text-green-500" : "text-gray-300"}`}>包含字母</p>
              <p className={`text-xs ${/[0-9]/.test(password) ? "text-green-500" : "text-gray-300"}`}>包含数字</p>
              <p className={`text-xs ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? "text-green-500" : "text-gray-300"}`}>包含特殊字符（可选）</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">确认密码</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="再次输入密码"
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none text-sm ${confirm && confirm !== password ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-green-500 focus:ring-green-100"}`} />
            {confirm && confirm !== password && <p className="text-xs text-red-400 mt-1">两次密码不一致</p>}
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50">
            {loading ? "注册中..." : "注 册"}
          </button>
          <p className="text-center text-sm text-gray-500">
            已有账户？ <Link href="/login" className="text-green-600 font-medium hover:underline">去登录</Link>
          </p>
        </form>
      </div>
    </div>
  );
}