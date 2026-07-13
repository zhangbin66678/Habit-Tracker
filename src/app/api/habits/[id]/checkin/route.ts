import { NextRequest, NextResponse } from "next/server";
import { connectDB, Habit, Checkin, getTodayStr } from "@/lib/db";
import { verifyToken, extractToken } from "@/lib/auth";

// POST /api/habits/[id]/checkin
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = extractToken(request);
  if (!token) return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ success: false, error: "登录已过期" }, { status: 401 });

  const habitId = params.id;
  if (!habitId) {
    return NextResponse.json({ success: false, error: "缺少习惯ID" }, { status: 400 });
  }

  try {
    await connectDB();

    const habit = await Habit.findById(habitId);
    if (!habit || habit.userId !== payload.userId) {
      return NextResponse.json({ success: false, error: "习惯不存在" }, { status: 404 });
    }

    const today = getTodayStr();
    const body = await request.json().catch(() => ({}));
    const { image, note } = body as { image?: string; note?: string };

    const existing = await Checkin.findOneAndDelete({
      userId: payload.userId,
      habitId,
      date: today,
    });

    if (existing) {
      return NextResponse.json({ success: true, checked: false, message: "已取消今日打卡" });
    }

    const checkin = await Checkin.create({
      habitId,
      userId: payload.userId,
      date: today,
      image: image || "",
      note: note || "",
    });

    return NextResponse.json({
      success: true,
      checked: true,
      data: {
        id: checkin._id.toString(),
        habitId,
        date: today,
        image: image || "",
        createdAt: checkin.createdAt.toISOString(),
      },
      message: "打卡成功",
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to check in" }, { status: 500 });
  }
}