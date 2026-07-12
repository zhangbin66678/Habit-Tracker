"use client";

import { useState, useEffect, useCallback } from "react";
import { authFetch } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useConfirm } from "@/contexts/ConfirmContext";

interface CheckinRecord {
  id: string;
  habitId: string;
  habitName: string;
  habitIcon: string;
  habitColor: string;
  date: string;
  image: string;
  note: string;
  createdAt: string;
}

function getMonthStr(offset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(month: string): string {
  const [y, m] = month.split("-");
  return `${y}年${parseInt(m)}月`;
}

function groupByDate(records: CheckinRecord[]): Record<string, CheckinRecord[]> {
  const groups: Record<string, CheckinRecord[]> = {};
  for (const r of records) {
    if (!groups[r.date]) groups[r.date] = [];
    groups[r.date].push(r);
  }
  return groups;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const yestStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  let prefix = `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
  if (dateStr === todayStr) prefix = "今天";
  else if (dateStr === yestStr) prefix = "昨天";
  return prefix;
}

export default function HistoryPage() {
  const [records, setRecords] = useState<CheckinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedImage, setSelectedImage] = useState<{ url: string; note: string } | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const month = getMonthStr(monthOffset);
      const res = await authFetch(`/api/checkins?month=${month}`);
      const json = await res.json();
      if (json.success) setRecords(json.data);
      else toast.showError("获取历史记录失败");
    } catch { toast.showError("网络错误"); }
    finally { setLoading(false); }
  }, [monthOffset, toast]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleDelete = (record: CheckinRecord) => {
    confirm.confirm({
      title: "删除打卡记录",
      message: `确定要删除「${record.habitName}」在 ${record.date} 的打卡记录吗？`,
      confirmText: "删除",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await authFetch(`/api/checkins?id=${record.id}`, { method: "DELETE" });
          const json = await res.json();
          if (json.success) {
            toast.showSuccess("已删除");
            setRecords((prev) => prev.filter((r) => r.id !== record.id));
          } else toast.showError(json.error || "删除失败");
        } catch { toast.showError("网络错误"); }
      },
    });
  };

  const grouped = groupByDate(records);
  const dateKeys = Object.keys(grouped).sort().reverse();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">历史记录</h1>
          <p className="text-sm text-gray-500 mt-1">共 {records.length} 条打卡</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonthOffset((o) => o - 1)}
            className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700 w-20 text-center">{getMonthLabel(getMonthStr(monthOffset))}</span>
          <button
            onClick={() => setMonthOffset((o) => Math.min(0, o + 1))}
            disabled={monthOffset >= 0}
            className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📅</p>
          <p>{monthOffset === 0 ? "今天还没有打卡记录" : "该月没有打卡记录"}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {dateKeys.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-semibold text-gray-700">{formatDateLabel(date)}</span>
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">{grouped[date].length}项</span>
              </div>
              <div className="space-y-2">
                {grouped[date].map((r) => (
                  <div key={r.id} className="bg-white rounded-xl p-3.5 border border-gray-100 flex items-start gap-3 group">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 mt-0.5"
                      style={{ backgroundColor: r.habitColor + "15" }}>
                      {r.habitIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-gray-800">{r.habitName}</span>
                        <button
                          onClick={() => handleDelete(r)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-opacity"
                          title="删除记录"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {r.note && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{r.note}</p>}
                      {r.image && (
                        <button onClick={() => setSelectedImage({ url: r.image, note: r.note })}
                          className="mt-2 block rounded-lg overflow-hidden border border-gray-100 hover:shadow-sm">
                          <img src={r.image} alt="" className="h-20 w-auto object-cover rounded-lg" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image preview */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
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