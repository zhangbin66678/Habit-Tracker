import { NextRequest, NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { connectDB, Habit, Checkin, getTodayStr } from "@/lib/db";
import { verifyToken, extractToken } from "@/lib/auth";
import { createLLM, checkRateLimit, getDailyCount } from "@/lib/ai";

function calculateStreak(checkinDates: string[]): number {
  const dateSet = new Set(checkinDates);
  const today = getTodayStr();
  let streak = 0;
  const start = new Date();

  if (!dateSet.has(today)) {
    start.setDate(start.getDate() - 1);
    const yd = new Date();
    yd.setDate(yd.getDate() - 1);
    const ydStr = `${yd.getFullYear()}-${String(yd.getMonth() + 1).padStart(2, "0")}-${String(yd.getDate()).padStart(2, "0")}`;
    if (!dateSet.has(ydStr)) return 0;
  }

  for (let i = 0; i < 365; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() - i);
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (dateSet.has(ds)) streak++;
    else break;
  }
  return streak;
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

    const [total, done, allCheckins] = await Promise.all([
      Habit.countDocuments({ userId: payload.userId }),
      Checkin.countDocuments({ userId: payload.userId, date: getTodayStr() }),
      Checkin.find({ userId: payload.userId }).sort({ date: -1 }).limit(365).select("date").lean(),
    ]);

    const streak = calculateStreak(allCheckins.map((c) => c.date));
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    const llm = createLLM(apiKey);
    const response = await llm.invoke([
      new HumanMessage(
        `你是一个善于激励用户的习惯养成助手。根据用户当前数据生成一条简短的激励语。

用户数据：
- 今日进度：${done}/${total}（${percent}%）
- 最长连续打卡天数：${streak}天
- 今天日期：${getTodayStr()}

要求：
- 50字以内
- 语气热情鼓励，可以适当用emoji
- 如果进度100%就庆祝，如果0%就鼓励开始
- 如果连续天数多就强调坚持的力量
- 直接输出激励语，不要额外解释`
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