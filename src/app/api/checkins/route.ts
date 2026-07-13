import { NextRequest, NextResponse } from "next/server";
import { connectDB, Habit, Checkin } from "@/lib/db";
import { verifyToken, extractToken } from "@/lib/auth";

// GET /api/checkins?month=2026-07
export async function GET(request: NextRequest) {
  const token = extractToken(request);
  if (!token) return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ success: false, error: "登录已过期" }, { status: 401 });

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // e.g. "2026-07"

    const query: Record<string, unknown> = { userId: payload.userId };
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      query.date = { $regex: `^${month}` };
    }

    const checkins = await Checkin.find(query).sort({ date: -1, createdAt: -1 }).lean();
    const habitIds = Array.from(new Set(checkins.map((c) => c.habitId)));
    const habits = await Habit.find({ _id: { $in: habitIds } }).lean();
    const habitMap = new Map(habits.map((h) => [h._id.toString(), h]));

    const data = checkins.map((c) => {
      const h = habitMap.get(c.habitId);
      return {
        id: c._id.toString(),
        habitId: c.habitId,
        habitName: h?.name || "",
        habitIcon: h?.icon || "",
        habitColor: h?.color || "",
        date: c.date,
        image: c.image,
        note: c.note,
        createdAt: c.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch checkins" }, { status: 500 });
  }
}

// DELETE /api/checkins?id=xxx
export async function DELETE(request: NextRequest) {
  const token = extractToken(request);
  if (!token) return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ success: false, error: "登录已过期" }, { status: 401 });

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "缺少记录ID" }, { status: 400 });

    const checkin = await Checkin.findOneAndDelete({ _id: id, userId: payload.userId });
    if (!checkin) {
      return NextResponse.json({ success: false, error: "记录不存在" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "删除成功" });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete checkin" }, { status: 500 });
  }
}