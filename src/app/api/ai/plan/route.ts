import { NextRequest, NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { connectDB, Habit, Checkin, getTodayStr } from "@/lib/db";
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
      error: `今日免费额度已用完（每日3次），剩余次数：0`,
      remaining: 0,
    });
  }

  try {
    await connectDB();

    const [habits, checkins] = await Promise.all([
      Habit.find({ userId: payload.userId }).select("name icon").lean(),
      Checkin.find({ userId: payload.userId, date: getTodayStr() }).select("habitId").lean(),
    ]);

    const checkedIds = new Set(checkins.map((c) => c.habitId));
    const habitList = habits.map((h) => ({
      name: h.name,
      done: checkedIds.has(h._id.toString()),
    }));

    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

    const llm = createLLM(apiKey);
    const response = await llm.invoke([
      new HumanMessage(
        `你是一个习惯养成助手。根据用户的习惯数据和当前时间，生成一条简洁的今日行动规划。

当前时间：${timeStr}
用户习惯：${JSON.stringify(habitList)}
已完成的习惯不要再安排。

要求：
- 200字以内
- 给出具体的执行顺序和时间建议
- 语气温暖鼓励
- 直接输出规划内容，不要用标题或markdown格式`
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