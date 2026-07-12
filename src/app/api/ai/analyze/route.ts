import { NextRequest, NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import pool from "@/lib/db";
import { verifyToken, extractToken } from "@/lib/auth";
import { createLLM, checkRateLimit, getDailyCount } from "@/lib/ai";

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
    const [habits] = await pool.query(
      "SELECT id, name, icon FROM habits WHERE user_id = ?",
      [payload.userId]
    );

    // Get last 7 days data
    const [checkins] = await pool.query(
      `SELECT habit_id, DATE_FORMAT(date, '%Y-%m-%d') AS date
       FROM checkins WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       ORDER BY date DESC`,
      [payload.userId]
    );

    const habitList = habits as Array<{ id: string; name: string; icon: string }>;
    const checkinList = checkins as Array<{ habit_id: string; date: string }>;

    // Build per-habit completion data for 7 days
    const analysis = habitList.map((h) => {
      const dates = checkinList.filter((c) => c.habit_id === h.id).map((c) => c.date);
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