import { NextRequest, NextResponse } from "next/server";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { connectDB, Habit, Checkin, getTodayStr } from "@/lib/db";
import { verifyToken, extractToken } from "@/lib/auth";
import { createLLM, checkRateLimit, getDailyCount } from "@/lib/ai";

function getDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function POST(request: NextRequest) {
  const token = extractToken(request);
  if (!token) return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ success: false, error: "登录已过期" }, { status: 401 });

  const { apiKey, message } = await request.json();
  if (!apiKey || typeof apiKey !== "string") {
    return NextResponse.json({ success: false, error: "请先配置 API Key" }, { status: 400 });
  }
  if (!message || typeof message !== "string") {
    return NextResponse.json({ success: false, error: "请输入消息" }, { status: 400 });
  }

  if (!checkRateLimit(payload.userId)) {
    return NextResponse.json({ success: false, error: "今日额度已用完", remaining: 0 });
  }

  try {
    await connectDB();

    // Gather user data
    const today = getTodayStr();
    const habits = await Habit.find({ userId: payload.userId }).lean();
    const todayCheckins = await Checkin.find({ userId: payload.userId, date: today }).lean();
    const weekAgo = getDateStr(new Date(Date.now() - 6 * 86400000));
    const recentCheckins = await Checkin.find({ userId: payload.userId, date: { $gte: weekAgo } }).lean();

    const checkedIds = new Set(todayCheckins.map((c) => c.habitId));
    const habitData = habits.map((h) => ({
      id: h._id.toString(),
      name: h.name,
      icon: h.icon,
      color: h.color,
      schedule: (h.schedule as number[]).length === 0 ? "每天" : (h.schedule as number[]).includes(-1) ? "仅一次" : (h.schedule as number[]).map((d: number) => ["日","一","二","三","四","五","六"][d]).join(""),
      timeRange: (h as unknown as { timeRange: string }).timeRange || "全天",
      done: checkedIds.has(h._id.toString()),
    }));

    // Per-habit 7-day stats
    const habitStats = habits.map((h) => {
      const days = recentCheckins.filter((c) => c.habitId === h._id.toString()).map((c) => c.date);
      return { name: h.name, checkedDays: days, rate: Math.round((days.length / 7) * 100) };
    });

    const systemPrompt = `你是一个智能习惯养成助手。你可以访问用户的个人数据来提供个性化服务。

用户当前数据：
- 今天日期：${today}
- 当前时间：${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, "0")}
- 全部习惯：${JSON.stringify(habitData)}
- 今日已完成：${todayCheckins.length}/${habits.length}
- 近7天各习惯完成率：${JSON.stringify(habitStats)}

你支持以下功能（根据用户消息自动判断）：
1. 今日规划 - 根据未完成的习惯和当前时间，生成执行顺序建议
2. 习惯分析 - 分析近7天打卡数据，找出薄弱环节并给建议
3. 激励鼓励 - 根据今日进度和连续打卡情况，给出激励语
4. 一键创建习惯 - 如果用户要求创建新习惯，你必须返回 JSON 格式

【重要】一键创建习惯的响应格式：
当用户要求创建习惯时，你的回复必须严格是以下JSON（不要包含任何其他文字）：
{"action":"create_habits","habits":[{"name":"习惯名称","icon":"⭐","color":"#3B82F6","schedule":[],"timeRange":"全天"}]}
- icon 可选：⭐🏃📚🧘💪🎯💤💧🍎✍️🎵🧹📚
- color 可选：#3B82F6 #10B981 #8B5CF6 #F59E0B #EF4444 #EC4899 #06B6D4 #84CC16
- schedule: []表示每天, [-1]表示仅一次, [0,1,2,3,4,5,6]中选表示具体星期几
- timeRange: "全天" 或 "HH:MM"

【重要】如果用户的消息不是创建习惯，直接用自然语言回复，不要返回JSON。

要求：回复简洁，语气温暖友好，适当使用emoji。每次回复不超过300字。`;

    const llm = createLLM(apiKey);
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(message),
    ]);

    const text = response.content.toString().trim();
    let parsed = null;

    // Try to parse as JSON for create_habits action
    if (text.startsWith("{")) {
      try { parsed = JSON.parse(text); } catch { /* not JSON, treat as text */ }
    }

    const result: { text: string; action?: unknown } = { text };

    if (parsed && parsed.action === "create_habits" && Array.isArray(parsed.habits)) {
      // Actually create the habits in DB
      const created = [];
      for (const h of parsed.habits) {
        if (!h.name || typeof h.name !== "string") continue;
        const doc = await Habit.create({
          userId: payload.userId,
          name: h.name.trim().slice(0, 50),
          color: h.color || "#3B82F6",
          icon: h.icon || "⭐",
          schedule: Array.isArray(h.schedule) ? h.schedule : [],
          timeRange: h.timeRange || "全天",
        });
        created.push({ id: doc._id.toString(), name: doc.name, icon: doc.icon });
      }
      result.action = { type: "create_habits", habits: created };
      result.text = `已为你创建了 ${created.length} 个新习惯：${created.map((h) => h.icon + " " + h.name).join("、")}。去习惯管理页可以调整详细设置。`;
    }

    return NextResponse.json({
      success: true,
      data: result,
      remaining: 10 - getDailyCount(payload.userId),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI 生成失败";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}