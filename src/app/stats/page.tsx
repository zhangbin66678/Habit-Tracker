"use client";

import { useState, useEffect, useCallback } from "react";
import { authFetch } from "@/contexts/AuthContext";

interface Habit { id: string; name: string; color: string; icon: string; }
interface Checkin { id: string; habitId: string; date: string; image?: string; note?: string; }

interface StatsData { habits: Habit[]; checkins: Checkin[]; }

function getDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getLastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    days.push(getDateStr(d));
  }
  return days;
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{ url: string; note: string } | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const [habitsRes, statsRes] = await Promise.all([
        authFetch("/api/habits"), authFetch("/api/stats"),
      ]);
      const habitsJson = await habitsRes.json();
      const statsJson = await statsRes.json();
      if (habitsJson.success && statsJson.success) {
        setStats({ habits: habitsJson.data, checkins: statsJson.data.checkins });
      }
    } catch (err) { console.error("Failed to fetch stats:", err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const { habits, checkins } = stats;
  const last30Days = getLastNDays(30);
  const last7Days = getLastNDays(7);
  const today = getDateStr(new Date());

  const checkinMap: Record<string, Set<string>> = {};
  for (const c of checkins) {
    if (!checkinMap[c.habitId]) checkinMap[c.habitId] = new Set();
    checkinMap[c.habitId].add(c.date);
  }

  const getStreak = (habitId: string): number => {
    const dates = checkinMap[habitId];
    if (!dates) return 0;
    let streak = 0;
    const start = new Date();
    if (!dates.has(today)) {
      start.setDate(start.getDate() - 1);
      if (!dates.has(getDateStr(start))) return 0;
    }
    for (let i = 0; i < 365; i++) {
      const d = new Date(start); d.setDate(d.getDate() - i);
      if (dates.has(getDateStr(d))) streak++; else break;
    }
    return streak;
  };

  const heatmapData = last30Days.map((date) => {
    const count = habits.filter((h) => checkinMap[h.id]?.has(date)).length;
    const intensity = habits.length > 0 ? count / habits.length : 0;
    return { date, count, intensity };
  });

  const totalCheckins = checkins.length;
  const perfectDays = heatmapData.filter((d) => d.count === habits.length && habits.length > 0).length;

  // Weekly stats
  const weekCheckins = checkins.filter((c) => last7Days.includes(c.date));
  const weekRate = habits.length > 0 ? Math.round((weekCheckins.length / (habits.length * 7)) * 100) : 0;

  const recentWithImages = checkins.filter((c) => c.image).slice(0, 6);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">数据统计</h1>
        <p className="text-sm text-gray-500 mt-1">近30天打卡数据</p>
      </div>

      {/* Overview */}
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

      {/* Weekly summary */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">本周概览</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">周完成率</span>
              <span className="text-sm font-bold text-blue-600">{weekRate}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-700" style={{ width: `${weekRate}%` }} />
            </div>
          </div>
          <div className="text-center px-3">
            <p className="text-2xl font-bold text-orange-500">{weekCheckins.length}</p>
            <p className="text-xs text-gray-400">本周打卡</p>
          </div>
        </div>
      </div>

      {/* Recent photos */}
      {recentWithImages.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">最近打卡照片</h2>
          <div className="grid grid-cols-3 gap-2">
            {recentWithImages.map((c) => (
              <button key={c.id} onClick={() => setSelectedImage({ url: c.image!, note: c.note || "" })}
                className="aspect-square rounded-xl overflow-hidden border border-gray-100 hover:shadow-md">
                <img src={c.image} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

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
              <div key={d.date} className={`w-8 h-8 rounded-md ${bg} flex items-center justify-center`}
                title={`${d.date}: ${d.count}次打卡`}>
                <span className="text-[9px] text-white font-medium opacity-80">{d.date.slice(8)}</span>
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

      {/* Per-habit stats */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">各习惯完成率</h2>
        <div className="space-y-4">
          {habits.map((habit) => {
            const dates = checkinMap[habit.id];
            const checkedDays = dates ? Array.from(dates).filter((d) => last30Days.includes(d)).length : 0;
            const rate = Math.round((checkedDays / 30) * 100);
            const streak = getStreak(habit.id);
            return (
              <div key={habit.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{habit.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{habit.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-orange-500 font-medium">{streak > 0 ? `🔥 连续${streak}天` : ""}</span>
                    <span className="text-sm font-bold" style={{ color: habit.color }}>{rate}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${rate}%`, backgroundColor: habit.color }} />
                </div>
              </div>
            );
          })}
          {habits.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">暂无数据</p>}
        </div>
      </div>

      {/* Image preview modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.url} alt="" className="w-full" />
            {selectedImage.note && <p className="p-3 text-sm text-gray-600">{selectedImage.note}</p>}
            <div className="p-3 text-right">
              <button onClick={() => setSelectedImage(null)} className="text-sm text-gray-400 hover:text-gray-600">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}