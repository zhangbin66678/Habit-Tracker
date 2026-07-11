"use client";

import { useState, useEffect, useCallback } from "react";

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
    const now = new Date();
    const str = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    setTodayStr(str);
    fetchHabits();
  }, [fetchHabits]);

  const toggleCheckin = async (habitId: string) => {
    try {
      const res = await fetch(`/api/habits/${habitId}/checkin`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        setHabits((prev) =>
          prev.map((h) =>
            h.id === habitId ? { ...h, checkedToday: json.checked } : h
          )
        );
      }
    } catch (err) {
      console.error("Checkin failed:", err);
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">今日打卡</h1>
        <p className="text-sm text-gray-500 mt-1">{todayStr}</p>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">今日进度</span>
          <span className="text-2xl font-bold text-blue-600">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          已完成 {checkedCount} / {totalCount} 个习惯
        </p>
      </div>

      {/* Habit List */}
      <div className="space-y-3">
        {habits.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🌱</p>
            <p>还没有习惯，去管理页添加吧</p>
          </div>
        )}
        {habits.map((habit) => (
          <button
            key={habit.id}
            onClick={() => toggleCheckin(habit.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 hover:shadow-md ${
              habit.checkedToday
                ? "bg-green-50 border-green-200"
                : "bg-white border-gray-100 hover:border-gray-200"
            }`}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{
                backgroundColor: habit.checkedToday
                  ? habit.color + "20"
                  : habit.color + "10",
              }}
            >
              {habit.checkedToday ? "✅" : habit.icon}
            </div>
            <div className="flex-1 text-left">
              <p
                className={`font-medium ${
                  habit.checkedToday
                    ? "text-green-700 line-through"
                    : "text-gray-800"
                }`}
              >
                {habit.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {habit.checkedToday ? "今日已完成" : "点击完成打卡"}
              </p>
            </div>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                habit.checkedToday
                  ? "bg-green-500 border-green-500"
                  : "border-gray-300"
              }`}
            >
              {habit.checkedToday && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}