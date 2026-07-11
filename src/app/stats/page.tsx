"use client";

import { useState, useEffect, useCallback } from "react";

interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface Checkin {
  id: string;
  habitId: string;
  date: string;
}

interface StatsData {
  habits: Habit[];
  checkins: Checkin[];
}

function getDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getLastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(getDateStr(d));
  }
  return days;
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const [habitsRes, statsRes] = await Promise.all([
        fetch("/api/habits"),
        fetch("/api/stats"),
      ]);
      const habitsJson = await habitsRes.json();
      const statsJson = await statsRes.json();

      if (habitsJson.success && statsJson.success) {
        setStats({
          habits: habitsJson.data,
          checkins: statsJson.data.checkins,
        });
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const { habits, checkins } = stats;
  const last30Days = getLastNDays(30);
  const today = getDateStr(new Date());

  // Build a lookup: habitId -> Set of dates
  const checkinMap: Record<string, Set<string>> = {};
  for (const c of checkins) {
    if (!checkinMap[c.habitId]) checkinMap[c.habitId] = new Set();
    checkinMap[c.habitId].add(c.date);
  }

  // Calculate streak for a habit (consecutive days ending today or yesterday)
  const getStreak = (habitId: string): number => {
    const dates = checkinMap[habitId];
    if (!dates) return 0;
    let streak = 0;
    const start = new Date();
    // Allow streak to count from today or yesterday
    const todayChecked = dates.has(today);
    if (!todayChecked) {
      start.setDate(start.getDate() - 1);
      if (!dates.has(getDateStr(start))) return 0;
    }
    for (let i = 0; i < 365; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() - i);
      if (dates.has(getDateStr(d))) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  // Heatmap data
  const heatmapData = last30Days.map((date) => {
    const count = habits.filter((h) => checkinMap[h.id]?.has(date)).length;
    const intensity = habits.length > 0 ? count / habits.length : 0;
    return { date, count, intensity };
  });

  const totalCheckins = checkins.length;
  const perfectDays = heatmapData.filter(
    (d) => d.count === habits.length && habits.length > 0
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">数据统计</h1>
        <p className="text-sm text-gray-500 mt-1">近30天打卡数据</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-blue-600">{habits.length}</p>
          <p className="text-xs text-gray-500 mt-1">追踪习惯</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-green-600">{totalCheckins}</p>
          <p className="text-xs text-gray-500 mt-1">总打卡次数</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-purple-600">{perfectDays}</p>
          <p className="text-xs text-gray-500 mt-1">全勤天数</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">打卡热力图</h2>
        <div className="flex flex-wrap gap-1.5">
          {heatmapData.map((d) => {
            let bg = "bg-gray-100";
            if (d.intensity > 0 && d.intensity <= 0.33) bg = "bg-green-200";
            else if (d.intensity > 0.33 && d.intensity <= 0.66) bg = "bg-green-400";
            else if (d.intensity > 0.66) bg = "bg-green-600";

            return (
              <div
                key={d.date}
                className={`w-8 h-8 rounded-md ${bg} flex items-center justify-center`}
                title={`${d.date}: ${d.count}次打卡`}
              >
                <span className="text-[9px] text-white font-medium opacity-80">
                  {d.date.slice(8)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-xs text-gray-400">少</span>
          <div className="w-4 h-4 rounded-sm bg-gray-100" />
          <div className="w-4 h-4 rounded-sm bg-green-200" />
          <div className="w-4 h-4 rounded-sm bg-green-400" />
          <div className="w-4 h-4 rounded-sm bg-green-600" />
          <span className="text-xs text-gray-400">多</span>
        </div>
      </div>

      {/* Per-habit Stats */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">各习惯完成率</h2>
        <div className="space-y-4">
          {habits.map((habit) => {
            const dates = checkinMap[habit.id];
            const checkedDays = dates
              ? Array.from(dates).filter((d) => last30Days.includes(d)).length
              : 0;
            const rate = Math.round((checkedDays / 30) * 100);
            const streak = getStreak(habit.id);
            return (
              <div key={habit.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{habit.icon}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {habit.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-orange-500 font-medium">
                      {streak > 0 ? `🔥 连续${streak}天` : ""}
                    </span>
                    <span className="text-sm font-bold" style={{ color: habit.color }}>
                      {rate}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{
                      width: `${rate}%`,
                      backgroundColor: habit.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
          {habits.length === 0 && (
            <p className="text-center text-gray-400 py-4 text-sm">
              暂无数据，开始打卡后这里会展示统计
            </p>
          )}
        </div>
      </div>
    </div>
  );
}