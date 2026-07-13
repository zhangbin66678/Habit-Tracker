import { NextRequest, NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { connectDB, Habit, Checkin } from "@/lib/db";
import { verifyToken, extractToken } from "@/lib/auth";
import { createLLM, checkRateLimit, getDailyCount } from "@/lib/ai";

function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function POST(request: NextRequest) {
  const token = extractToken(request);
  if (!token) return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ success: false, error: "登录已过期" }, { status: 401 });

  const { apiKey } = await request.json();
  if (!apiKey || typeof apiKey !== "string") {
    return NextResponse.json({ success: false, error: "请先配置 OpenAI API Key" }, { status: 400 });
  }

  if (!checkRateLimit(payload.userId)) {
    return NextResponse.json({
      success: false,
      error: "今日免费额度已用完",
      remaining: 0,
    });
  }

  try {
    await connectDB();

    const [habits, checkins] = await Promise.all([
      Habit.find({ userId: payload.userId }).select("name icon").lean(),
      (() => {
        const sevenDaysAgo = formatDateStr(new Date(Date.now() - 6 * 86400000));
        return Checkin.find({ userId: payload.userId, date: { $gte: sevenDaysAgo } })
          .select("habitId date")
          .sort({ date: -1 })
          .lean();
      })(),
    ]);

    const habitList = habits.map((h) => ({
      id: h._id.toString(),
      name: h.name,
      icon: h.icon,
    }));
    const checkinList = checkins.map((c) => ({
      habitId: c.habitId,
      date: c.date,
    }));

    // Build per-habit completion data for 7 days
    const analysis = habitList.map((h) => {
      const dates = checkinList.filter((c) => c.habitId === h.id).map((c) => c.date);
      return { name: h.name, checkedDays: dates, totalDays: 7, rate: Math.round((dates.length / 7) * 100) };
    });

    const llm = createLLM(apiKey);
    const response = await llm.invoke([
      new HumanMessage(
        `你是一个习惯分析专家。分析用户过去7天的习惯打卡数据，给出改进建议。

用户习惯数据（近7天）：
${JSON.stringify(analysis, null, 2)}

请分析：
1. 哪些习惯坚持得好，哪些经常漏打
2. 给出具体可行的改进建议（2-3条）
3. 语气专业但友好

要求：300字以内，直接输出分析内容，不要用markdown格式。`
      ),
    ]);

    return NextResponse.json({
      success: true,
      data: response.content.toString(),
      remaining: 3 - getDailyCount(payload.userId),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI 生成失败";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}