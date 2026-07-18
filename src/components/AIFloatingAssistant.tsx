"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth, authFetch } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIFloatingAssistant() {
  const { user } = useAuth();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "你好!我是 AI 助手,可以帮你分析最近 7 天的习惯打卡情况。点击下方按钮开始分析!",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("openai_api_key") || "";
      setApiKey(savedKey);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) return null;

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast.showError("请输入 API Key");
      return;
    }
    localStorage.setItem("openai_api_key", apiKey.trim());
    setShowKeyInput(false);
    toast.showSuccess("API Key 已保存");
  };

  const handleAnalyze = async () => {
    if (!apiKey) {
      toast.showError("请先配置 API Key");
      setShowKeyInput(true);
      return;
    }

    setLoading(true);
    const userMessage: Message = { role: "user", content: "帮我分析最近 7 天的习惯打卡情况" };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await authFetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });

      const json = await res.json();

      if (json.success) {
        const assistantMessage: Message = { role: "assistant", content: json.data };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        toast.showError(json.error || "分析失败");
        setMessages((prev) => prev.slice(0, -1)); // 移除用户消息
      }
    } catch {
      toast.showError("网络错误");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 悬浮按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
          isOpen
            ? "bg-gray-700 hover:bg-gray-800"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        }`}
        title="AI 助手"
      >
        {isOpen ? (
          <span className="text-white text-2xl">×</span>
        ) : (
          <span className="text-white text-2xl">🤖</span>
        )}
      </button>

      {/* 展开的对话窗口 */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col" style={{ maxHeight: "500px" }}>
          {/* 顶部标题 */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <div>
                  <h3 className="font-semibold">AI 助手</h3>
                  <p className="text-xs opacity-90">DeepSeek 驱动</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="text-white/80 hover:text-white px-2 py-1"
                title="配置 API Key"
              >
                🔑
              </button>
            </div>
          </div>

          {/* API Key 输入区 */}
          {showKeyInput && (
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="输入 DeepSeek API Key (sk-...)"
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:border-blue-500 outline-none"
                />
                <button
                  onClick={handleSaveKey}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
            </div>
          )}

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: "200px" }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`rounded-lg p-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-100 text-blue-800 ml-6"
                    : "bg-gray-100 text-gray-700 mr-2"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="bg-gray-100 rounded-lg p-3 mr-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* 快捷操作 */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all text-sm"
            >
              {loading ? "分析中..." : "🔍 分析最近 7 天习惯"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}