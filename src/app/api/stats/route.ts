import { NextRequest, NextResponse } from "next/server";
import { connectDB, Habit, Checkin } from "@/lib/db";
import { verifyToken, extractToken } from "@/lib/auth";

// GET /api/stats
export async function GET(request: NextRequest) {
  const token = extractToken(request);
  if (!token) return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ success: false, error: "登录已过期" }, { status: 401 });

  try {
    await connectDB();

    const [habits, checkins] = await Promise.all([
      Habit.find({ userId: payload.userId }).sort({ createdAt: -1 }).lean(),
      Checkin.find({ userId: payload.userId }).sort({ date: -1 }).lean(),
    ]);

    const habitsData = habits.map((h) => ({
      id: h._id.toString(),
      name: h.name,
      color: h.color,
      icon: h.icon,
      createdAt: h.createdAt.toISOString(),
    }));

    const checkinsData = checkins.map((c) => ({
      id: c._id.toString(),
      habitId: c.habitId,
      date: c.date,
      image: c.image,
      note: c.note,
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: { habits: habitsData, checkins: checkinsData } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to read stats" }, { status: 500 });
  }
}