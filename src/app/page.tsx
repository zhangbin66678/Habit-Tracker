"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { authFetch } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useConfirm } from "@/contexts/ConfirmContext";

interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string;
  checkedToday: boolean;
}

export default function HomePage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayStr, setTodayStr] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [lastCheckinId, setLastCheckinId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const confirmCtx = useConfirm();

  // AI states
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [remaining, setRemaining] = useState(3);

  useEffect(() => { setApiKey(localStorage.getItem("openai_api_key") || ""); }, []);

  const callAI = async (type: "plan" | "motivate") => {
    const key = apiKey || localStorage.getItem("openai_api_key") || "";
    if (!key) { setShowKeyInput(true); return; }
    setAiLoading(true);
    try {
      const res = await authFetch(`/api/ai/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key }),
      });
      const json = await res.json();
      if (json.success) { setAiResult(json.data); setRemaining(json.remaining); }
      else toast.showError(json.error || "AI 生成失败");
    } catch { toast.showError("网络错误"); }
    finally { setAiLoading(false); }
  };

  const saveKey = () => {
    localStorage.setItem("openai_api_key", apiKey);
    setShowKeyInput(false);
    toast.showSuccess("API Key 已保存");
  };

  const fetchHabits = useCallback(async () => {
    try {
      const res = await authFetch("/api/habits");
      const json = await res.json();
      if (json.success) setHabits(json.data);
    } catch (err) {
      console.error("Failed to fetch habits:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const now = new Date();
    setTodayStr(`${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`);
    fetchHabits();
  }, [fetchHabits]);

  const toggleCheckin = async (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    // Confirm before unchecking
    if (habit?.checkedToday) {
      confirmCtx.confirm({
        title: "取消打卡",
        message: `确定要取消「${habit.name}」的今日打卡吗？`,
        confirmText: "取消打卡",
        danger: true,
        onConfirm: () => doCheckin(habitId),
      });
      return;
    }
    doCheckin(habitId);
  };

  const doCheckin = async (habitId: string) => {
    try {
      const res = await authFetch(`/api/habits/${habitId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (json.success) {
        setHabits((prev) =>
          prev.map((h) =>
            h.id === habitId ? { ...h, checkedToday: json.checked } : h
          )
        );
        if (json.checked) {
          if (json.data?.id) setLastCheckinId(json.data.id);
          setExpandedId(habitId);
          toast.showSuccess("打卡成功");
        } else {
          toast.showInfo("已取消打卡");
        }
      } else {
        toast.showError(json.error || "操作失败");
      }
    } catch {
      toast.showError("网络错误");
    }
  };

  const handleImageUpload = async (habitId: string, file: File) => {
    setUploadingId(habitId);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await authFetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success && lastCheckinId) {
        await authFetch("/api/checkins", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: lastCheckinId, image: json.data.url, note }),
        });
        toast.showSuccess("图片已保存");
      }
      setExpandedId(null);
      setNote("");
    } catch {
      toast.showError("上传失败");
    } finally {
      setUploadingId(null);
    }
  };

  const checkedCount = habits.filter((h) => h.checkedToday).length;
  const totalCount = habits.length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">今日打卡</h1>
        <p className="text-sm text-gray-500 mt-1">{todayStr}</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: progress + habits */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">今日进度</span>
              <span className="text-2xl font-bold text-blue-600">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-2">已完成 {checkedCount} / {totalCount} 个习惯</p>
          </div>

          <div className="space-y-3">
            {habits.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">🌱</p>
                <p>还没有习惯，去管理页添加吧</p>
              </div>
            )}
            {habits.map((habit) => (
              <div key={habit.id}>
                <button onClick={() => toggleCheckin(habit.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 hover:shadow-md ${habit.checkedToday ? "bg-green-50 border-green-200" : "bg-white border-gray-100 hover:border-gray-200"}`}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: habit.color + "15" }}>
                    {habit.checkedToday ? "✅" : habit.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${habit.checkedToday ? "text-green-700 line-through" : "text-gray-800"}`}>{habit.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{habit.checkedToday ? "今日已完成" : "点击完成打卡"}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${habit.checkedToday ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
                    {habit.checkedToday && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                </button>
                {expandedId === habit.id && (
                  <div className="mt-2 ml-4 p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                    <p className="text-xs text-gray-500">添加打卡记录（可选）</p>
                    <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="写点什么..." maxLength={200}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 outline-none" />
                    <div className="flex items-center gap-2">
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                        onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(habit.id, file); }} />
                      <button onClick={() => fileInputRef.current?.click()} disabled={uploadingId === habit.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-50">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {uploadingId === habit.id ? "上传中..." : "添加图片"}
                      </button>
                      <button onClick={() => { setExpandedId(null); setNote(""); }} className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600">跳过</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">快捷操作</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 text-blue-700">
                <span className="text-lg">📋</span>
                <div><p className="text-sm font-medium">待完成</p><p className="text-xs text-blue-400">{totalCount - checkedCount} 个习惯</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 text-green-700">
                <span className="text-lg">✅</span>
                <div><p className="text-sm font-medium">已完成</p><p className="text-xs text-green-400">{checkedCount} 个习惯</p></div>
              </div>
            </div>
          </div>
          {habits.length === 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <p className="text-4xl mb-3">🌱</p>
              <p className="text-sm text-gray-500">还没有习惯</p>
              <p className="text-xs text-gray-400 mt-1">去管理页添加你的第一个习惯</p>
            </div>
          )}
          {checkedCount === totalCount && totalCount > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 text-center">
              <p className="text-3xl mb-2">🎉</p>
              <p className="font-semibold text-green-700">今日全勤!</p>
              <p className="text-xs text-green-500 mt-1">所有习惯已完成打卡</p>
            </div>
          )}

          {/* AI Assistant */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <h3 className="font-semibold text-gray-800 text-sm">AI 助手</h3>
                <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">LangChain</span>
              </div>
              <button onClick={() => setShowKeyInput(!showKeyInput)}
                className="w-6 h-6 rounded-md bg-white border border-blue-200 flex items-center justify-center text-blue-400 hover:bg-blue-50">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>
            {showKeyInput && (
              <div className="bg-white rounded-lg p-2.5 mb-3 border border-blue-200 space-y-1.5">
                <p className="text-[11px] text-gray-500">OpenAI API Key（仅存本地）</p>
                <div className="flex gap-1.5">
                  <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:border-blue-400 outline-none" />
                  <button onClick={saveKey} className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">保存</button>
                </div>
              </div>
            )}
            <div className="flex gap-1.5 mb-3">
              <button onClick={() => callAI("plan")} disabled={aiLoading || remaining <= 0}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium border border-blue-200 text-blue-600 hover:bg-blue-100 disabled:opacity-40">
                {aiLoading ? <div className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" /> : <span>📋</span>}
                今日规划
              </button>
              <button onClick={() => callAI("motivate")} disabled={aiLoading || remaining <= 0}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium border border-blue-200 text-blue-600 hover:bg-blue-100 disabled:opacity-40">
                {aiLoading ? <div className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" /> : <span>💪</span>}
                来点激励
              </button>
            </div>
            {aiResult && (
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{aiResult}</p>
              </div>
            )}
            <p className="text-[10px] text-gray-400 mt-2 text-right">今日剩余 {remaining}/3 次</p>
          </div>
        </div>
      </div>
    </div>
  );
}