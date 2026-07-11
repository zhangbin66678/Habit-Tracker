"use client";

import { useState, useEffect, useCallback } from "react";

interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt?: string;
}

const COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4", "#84CC16"];
const ICONS = ["⭐", "🏃", "📚", "🧘", "💪", "🎯", "💤", "💧", "🍎", "✍️", "🎵", "🧹"];

export default function ManagePage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch("/api/habits");
      const json = await res.json();
      if (json.success) {
        setHabits(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch habits:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length === 0) {
      setError("请输入习惯名称");
      return;
    }
    if (name.trim().length > 50) {
      setError("习惯名称不能超过50个字符");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), color, icon }),
      });
      const json = await res.json();

      if (json.success) {
        setName("");
        setColor(COLORS[0]);
        setIcon(ICONS[0]);
        setShowForm(false);
        fetchHabits();
      } else {
        setError(json.error || "创建失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, habitName: string) => {
    if (!confirm(`确定要删除习惯「${habitName}」吗？相关打卡记录也会被清除。`)) {
      return;
    }
    try {
      const res = await fetch(`/api/habits?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setHabits((prev) => prev.filter((h) => h.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">习惯管理</h1>
          <p className="text-sm text-gray-500 mt-1">共 {habits.length} 个习惯</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 active:scale-95"
        >
          {showForm ? "取消" : "+ 新增"}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 space-y-4"
        >
          <h3 className="font-semibold text-gray-800">新增习惯</h3>

          {/* Name */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">习惯名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：晨跑30分钟"
              maxLength={50}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{name.length}/50</p>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">选择图标</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg border-2 ${
                    icon === i
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">选择颜色</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === c ? "border-gray-800 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: color + "15" }}
            >
              {icon}
            </div>
            <span className="font-medium text-gray-700">{name || "习惯名称预览"}</span>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "创建中..." : "创建习惯"}
          </button>
        </form>
      )}

      {/* Habit List */}
      <div className="space-y-3">
        {habits.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p>还没有习惯，点击上方按钮添加</p>
          </div>
        )}
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ backgroundColor: habit.color + "15" }}
            >
              {habit.icon}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">{habit.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                创建于 {habit.createdAt ? new Date(habit.createdAt).toLocaleDateString("zh-CN") : "未知"}
              </p>
            </div>
            <button
              onClick={() => handleDelete(habit.id, habit.name)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
            >
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