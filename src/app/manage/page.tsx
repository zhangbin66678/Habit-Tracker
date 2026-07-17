"use client";

import { useState, useEffect, useCallback } from "react";
import { authFetch } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useConfirm } from "@/contexts/ConfirmContext";

interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string;
  schedule?: string;
  timeRange?: string;
  createdAt?: string;
}

const COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4", "#84CC16"];
const ICONS = ["⭐", "🏃", "📚", "🧘", "💪", "🎯", "💤", "💧", "🍎", "✍️", "🎵", "🧹"];
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export default function ManagePage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);
  const [schedule, setSchedule] = useState<number[]>([]); // [] = everyday, [-1] = once
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [expireDate, setExpireDate] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const confirmCtx = useConfirm();

  const fetchHabits = useCallback(async () => {
    try {
      const res = await authFetch("/api/habits");
      const json = await res.json();
      if (json.success) setHabits(json.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const resetForm = () => {
    setName(""); setColor(COLORS[0]); setIcon(ICONS[0]); setSchedule([]); setHour(8); setMinute(0); setShowTimePicker(false); setExpireDate(""); setError(""); setEditingId(null);
  };

  const startEdit = (habit: Habit) => {
    setEditingId(habit.id);
    setName(habit.name);
    setColor(habit.color);
    setIcon(habit.icon);
    setShowForm(true);
    setError("");
  };

  const toggleDay = (d: number) => {
    setSchedule((prev) => {
      if (prev.includes(d)) return prev.filter((x) => x !== d);
      return [...prev, d].sort();
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (name.trim().length === 0) { setError("请输入习惯名称"); return; }
    if (name.trim().length > 50) { setError("习惯名称不能超过50个字符"); return; }

    setSubmitting(true);
    try {
      const tr = showTimePicker ? `${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}` : "全天";
      const body = { name: name.trim(), color, icon, schedule, timeRange: tr, expireDate: schedule[0] === -1 ? expireDate : "" };
      if (editingId) Object.assign(body, { id: editingId });
      const method = editingId ? "PUT" : "POST";
      const res = await authFetch("/api/habits", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) { resetForm(); setShowForm(false); fetchHabits(); toast.showSuccess(editingId ? "更新成功" : "创建成功"); }
      else setError(json.error || "操作失败");
    } catch { setError("网络错误，请重试"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = (id: string, habitName: string) => {
    confirmCtx.confirm({
      title: "删除习惯",
      message: `确定要删除「${habitName}」吗？相关打卡记录也会被清除。`,
      confirmText: "删除",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await authFetch(`/api/habits?id=${id}`, { method: "DELETE" });
          const json = await res.json();
          if (json.success) { setHabits((prev) => prev.filter((h) => h.id !== id)); toast.showSuccess("已删除"); }
          else toast.showError(json.error || "删除失败");
        } catch { toast.showError("网络错误"); }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">习惯管理</h1>
          <p className="text-sm text-gray-500 mt-1">共 {habits.length} 个习惯</p>
        </div>
        <button
          onClick={() => { if (showForm) { resetForm(); } setShowForm(!showForm); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 active:scale-95"
        >
          {showForm ? "取消" : "+ 新增"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 space-y-4">
          <h3 className="font-semibold text-gray-800">{editingId ? "编辑习惯" : "新增习惯"}</h3>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">习惯名称</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="例如：晨跑30分钟" maxLength={50}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
            <p className="text-xs text-gray-400 mt-1 text-right">{name.length}/50</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">选择图标</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((i) => (
                <button key={i} type="button" onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg border-2 ${icon === i ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-200"}`}>{i}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">选择颜色</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 ${color === c ? "border-gray-800 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">重复计划</label>
            <div className="flex items-center gap-2 mb-2">
              {([
                { label: "每天", value: [] as number[] },
                { label: "仅一次", value: [-1] as number[] },
              ]).map((opt) => (
                <button key={opt.label} type="button" onClick={() => setSchedule(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-colors ${JSON.stringify(schedule) === JSON.stringify(opt.value) ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  {opt.label}
                </button>
              ))}
              <span className="text-xs text-gray-400">或选择具体星期</span>
            </div>
            {schedule[0] !== -1 && (
              <div className="flex gap-1.5">
                {WEEKDAYS.map((d, i) => (
                  <button key={i} type="button" onClick={() => { if (schedule.length === 0) setSchedule([i]); else toggleDay(i); }}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-medium border-2 transition-colors ${
                      schedule.includes(i) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-100 text-gray-400 hover:border-gray-200"
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            )}
            {schedule[0] === -1 && (
              <div className="mt-2">
                <input type="date" value={expireDate} onChange={(e) => setExpireDate(e.target.value)} min={new Date().toISOString().slice(0, 10)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 outline-none" />
                <p className="text-xs text-gray-400 mt-1">选择目标日期，过期后自动隐藏</p>
              </div>
            )}
            {schedule.length > 0 && schedule[0] !== -1 && (
              <p className="text-xs text-gray-400 mt-1.5">
                已选：{schedule.map((d) => "周" + WEEKDAYS[d]).join("、")}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">提醒时间</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setShowTimePicker(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-colors ${!showTimePicker ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                全天
              </button>
              <button type="button" onClick={() => setShowTimePicker(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-colors ${showTimePicker ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                定时提醒
              </button>
            </div>
            {showTimePicker && (
              <div className="flex items-center justify-center gap-2 mt-3">
                {/* Hour wheel */}
                <div className="relative h-36 w-20 overflow-hidden rounded-xl bg-gray-50 border border-gray-200">
                  <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 border-y-2 border-blue-200 bg-blue-50/50 rounded-lg z-0" />
                  <div className="h-full overflow-y-auto scrollbar-hide px-1 pt-[52px] pb-[52px]"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      const idx = Math.round(el.scrollTop / 36);
                      if (idx >= 0 && idx <= 23) setHour(idx);
                    }}>
                    {Array.from({ length: 24 }, (_, i) => (
                      <div key={i} className={`h-9 flex items-center justify-center text-lg font-medium ${i === hour ? "text-blue-600" : "text-gray-400"}`}>
                        {String(i).padStart(2, "0")}
                      </div>
                    ))}
                  </div>
                </div>
                <span className="text-xl font-bold text-gray-400">:</span>
                {/* Minute wheel */}
                <div className="relative h-36 w-20 overflow-hidden rounded-xl bg-gray-50 border border-gray-200">
                  <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 border-y-2 border-blue-200 bg-blue-50/50 rounded-lg z-0" />
                  <div className="h-full overflow-y-auto scrollbar-hide px-1 pt-[52px] pb-[52px]"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      const idx = Math.round(el.scrollTop / 36);
                      if (idx >= 0 && idx <= 59) setMinute(idx);
                    }}>
                    {Array.from({ length: 60 }, (_, i) => (
                      <div key={i} className={`h-9 flex items-center justify-center text-lg font-medium ${i === minute ? "text-blue-600" : "text-gray-400"}`}>
                        {String(i).padStart(2, "0")}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="ml-2 text-sm text-gray-500">
                  <p className="font-medium">{String(hour).padStart(2,"0")}:{String(minute).padStart(2,"0")}</p>
                </div>
              </div>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: color + "15" }}>{icon}</div>
            <div>
              <span className="font-medium text-gray-700">{name || "习惯名称预览"}</span>
              <p className="text-xs text-gray-400">
                {schedule[0] === -1 ? (expireDate ? `仅一次 (${expireDate})` : "仅一次") : schedule.length === 0 ? "每天" : schedule.map((d) => "周" + WEEKDAYS[d]).join("、")}
                {showTimePicker ? ` · ${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}` : ""}
              </p>
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={submitting}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-50">
            {submitting ? "保存中..." : editingId ? "保存修改" : "创建习惯"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {habits.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p>还没有习惯，点击上方按钮添加</p>
          </div>
        )}
        {habits.map((habit) => (
          <div key={habit.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ backgroundColor: habit.color + "15" }}>{habit.icon}</div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">{habit.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {habit.schedule || "每天"}{habit.timeRange && habit.timeRange !== "全天" ? ` · ${habit.timeRange}` : ""} · 创建于 {habit.createdAt ? new Date(habit.createdAt).toLocaleDateString("zh-CN") : "未知"}
              </p>
            </div>
            <button onClick={() => startEdit(habit)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button onClick={() => handleDelete(habit.id, habit.name)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}