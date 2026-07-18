"use client";

import { useState, useEffect } from "react";
import { useAuth, authFetch } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";

interface PlanTask {
  id: string;
  time: string;
  title: string;
  duration: number;
  description: string;
  category: string;
  priority: "high" | "medium" | "low";
}

interface PlanResponse {
  success: boolean;
  data?: {
    date: string;
    summary: string;
    tasks: PlanTask[];
  };
  remaining?: number;
  error?: string;
}

const CATEGORIES = [
  { value: "work", label: "工作学习", icon: "💼", color: "bg-blue-100 text-blue-700" },
  { value: "health", label: "运动健康", icon: "🏃", color: "bg-green-100 text-green-700" },
  { value: "study", label: "学习成长", icon: "📚", color: "bg-purple-100 text-purple-700" },
  { value: "life", label: "日常生活", icon: "🏠", color: "bg-orange-100 text-orange-700" },
  { value: "social", label: "社交娱乐", icon: "🎉", color: "bg-pink-100 text-pink-700" },
  { value: "rest", label: "休息放松", icon: "😴", color: "bg-indigo-100 text-indigo-700" },
];

// 用于创建习惯的图标和颜色映射
const CATEGORY_ICONS: Record<string, string> = {
  work: "💼",
  health: "🏃",
  study: "📚",
  life: "🏠",
  social: "🎉",
  rest: "😴",
};

const CATEGORY_COLORS: Record<string, string> = {
  work: "#3B82F6",
  health: "#10B981",
  study: "#8B5CF6",
  life: "#F59E0B",
  social: "#EC4899",
  rest: "#6366F1",
};

const QUICK_SUGGESTIONS = [
  "明天上午要完成项目报告,下午健身,晚上陪家人吃饭",
  "我想高效工作8小时,然后读书1小时,10点前睡觉",
  "准备一场重要面试,需要练习自我介绍和算法题",
  "周末想学做新菜,打扫房间,下午和朋友去爬山",
  "明天要参加马拉松比赛,需要早起做热身和准备",
];

export default function AgentPage() {
  const { user, loading } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [targetDate, setTargetDate] = useState(getTomorrowDate());
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepTime, setSleepTime] = useState("23:00");
  const [loading2, setLoading2] = useState(false);
  const [plan, setPlan] = useState<PlanResponse["data"] | null>(null);
  const [remaining, setRemaining] = useState(10);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editableTasks, setEditableTasks] = useState<PlanTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("openai_api_key") || "";
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast.showError("请输入 API Key");
      return;
    }
    localStorage.setItem("openai_api_key", apiKey.trim());
    setShowKeyInput(false);
    toast.showSuccess("API Key 已保存");
  };

  const generatePlan = async () => {
    if (!apiKey.trim()) {
      toast.showError("请先配置 API Key");
      setShowKeyInput(true);
      return;
    }

    if (!userInput.trim()) {
      toast.showError("请告诉 AI 你明天想做什么");
      return;
    }

    console.log("[agent] 开始生成规划...");
    setLoading2(true);
    try {
      const res = await authFetch("/api/ai/agent-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          userInput: userInput.trim(),
          targetDate,
          wakeTime,
          sleepTime,
        }),
      });
      console.log("[agent] 响应状态:", res.status);
      const json: PlanResponse = await res.json();
      console.log("[agent] 响应数据:", json);
      if (json.success && json.data) {
        setPlan(json.data);
        setRemaining(json.remaining ?? 10);
        // 打开确认弹窗
        setEditableTasks(json.data.tasks);
        setSelectedTasks(new Set(json.data.tasks.map(t => t.id)));
        setShowConfirmModal(true);
        toast.showSuccess("规划生成成功!请确认并添加到习惯");
      } else {
        toast.showError(json.error || "生成失败");
      }
    } catch (e) {
      console.error("[agent] 错误:", e);
      toast.showError("网络错误");
    } finally {
      setLoading2(false);
    }
  };

  // 确认并添加选中任务为习惯
  const handleConfirm = async () => {
    if (selectedTasks.size === 0) {
      toast.showError("请至少选择一个任务");
      return;
    }

    setSubmitting(true);
    try {
      const tasksToCreate = editableTasks.filter(t => selectedTasks.has(t.id));
      let successCount = 0;

      for (const task of tasksToCreate) {
        const categoryIcon = CATEGORY_ICONS[task.category] || "⭐";
        const categoryColor = CATEGORY_COLORS[task.category] || "#3B82F6";

        const res = await authFetch("/api/habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: task.title,
            icon: categoryIcon,
            color: categoryColor,
            schedule: [-1], // 仅一次
            timeRange: task.time,
            expireDate: targetDate,
          }),
        });

        if (res.ok) successCount++;
      }

      toast.showSuccess(`成功添加 ${successCount} 个习惯!`);
      setShowConfirmModal(false);
      router.push("/");
    } catch (e) {
      console.error(e);
      toast.showError("添加失败");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 顶部标题 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-3xl">🧠</span>
                智能规划助手
              </h1>
              <p className="text-sm text-gray-500 mt-1">告诉 AI 你明天想做什么,一键生成科学的日程规划</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">DeepSeek AI</span>
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="w-8 h-8 rounded-lg bg-white border border-indigo-200 flex items-center justify-center text-indigo-500 hover:bg-indigo-50"
                title="配置 API Key"
              >
                🔑
              </button>
            </div>
          </div>

          {/* API Key 输入区 */}
          {showKeyInput && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="输入 DeepSeek API Key (sk-...)"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                />
                <button
                  onClick={handleSaveKey}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                >
                  保存
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">API Key 仅保存在本地浏览器,不会上传服务器</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧:输入区 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基础设置 */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>📋</span>基础信息
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">目标日期</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">起床时间</label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">睡觉时间</label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 用户输入 */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span>💭</span>告诉 AI 你想做什么
              </h2>
              <p className="text-xs text-gray-500 mb-3">越详细,生成的规划越精准</p>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="例如:明天上午要完成项目报告,下午3点健身,晚上陪家人吃饭,9点要读书1小时..."
                rows={6}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none resize-none"
              />

              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">💡 快速示例(点击填入):</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setUserInput(s)}
                      className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full transition-colors"
                    >
                      {s.length > 20 ? s.slice(0, 20) + "..." : s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={generatePlan}
                disabled={loading2}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {loading2 ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    AI 正在思考...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    一键生成规划
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 右侧:规划结果 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>📅</span>我的规划
              </h2>
              {!plan ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-5xl mb-3">🤖</div>
                  <p className="text-sm">填写信息后点击"一键生成"</p>
                  <p className="text-xs mt-1">AI 帮你安排明天的日程</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {plan.tasks.map((task) => {
                    const cat = CATEGORIES.find((c) => c.value === task.category) || CATEGORIES[3];
                    const priorityColor =
                      task.priority === "high"
                        ? "border-l-red-500"
                        : task.priority === "medium"
                        ? "border-l-yellow-500"
                        : "border-l-green-500";
                    return (
                      <div
                        key={task.id}
                        className={`bg-gray-50 rounded-lg p-3 border-l-4 ${priorityColor} hover:bg-gray-100 transition-colors`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{cat.icon}</span>
                            <span className="text-xs font-semibold text-gray-700">{task.time}</span>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${cat.color}`}>{cat.label}</span>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">{task.title}</h4>
                        <p className="text-xs text-gray-500">{task.description}</p>
                        <p className="text-[10px] text-gray-400 mt-1">⏱ {task.duration} 分钟</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部规划总览 */}
        {plan && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <span>🎯</span>规划总览
            </h3>
            <p className="text-sm leading-relaxed opacity-95">{plan.summary}</p>
            <div className="mt-4 flex gap-4 text-xs opacity-90">
              <span>📅 {plan.date}</span>
              <span>📋 {plan.tasks.length} 个任务</span>
              <span>
                ⏱ 总时长 {plan.tasks.reduce((s, t) => s + t.duration, 0)} 分钟
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 确认弹窗 */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">确认添加习惯</h2>
                  <p className="text-sm text-gray-500 mt-1">选择要添加的任务,可编辑名称</p>
                </div>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {editableTasks.map((task, index) => {
                const isSelected = selectedTasks.has(task.id);
                return (
                  <div
                    key={task.id}
                    className={`border rounded-lg p-4 transition-all ${
                      isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newSet = new Set(selectedTasks);
                          if (e.target.checked) {
                            newSet.add(task.id);
                          } else {
                            newSet.delete(task.id);
                          }
                          setSelectedTasks(newSet);
                        }}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-600">{task.time}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                            {CATEGORIES.find(c => c.value === task.category)?.label || "其他"}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => {
                            const newTasks = [...editableTasks];
                            newTasks[index] = { ...task, title: e.target.value };
                            setEditableTasks(newTasks);
                          }}
                          className="w-full px-3 py-2 rounded border border-gray-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting || selectedTasks.size === 0}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    添加中...
                  </>
                ) : (
                  <>
                    ✅ 确认添加 {selectedTasks.size} 个习惯
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
