import { NextRequest, NextResponse } from "next/server";
import { connectDB, Checkin, Habit } from "@/lib/db";
import { verifyToken, extractToken } from "@/lib/auth";

function getUser(request: NextRequest) {
  const token = extractToken(request);
  if (!token) return null;
  return verifyToken(token);
}

// GET /api/checkins?month=2026-07
export async function GET(request: NextRequest) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });

  try {
    await connectDB();
    const month = request.nextUrl.searchParams.get("month") || new Date().toISOString().slice(0, 7);
    const checkins = await Checkin.find({
      userId: user.userId,
      date: { $regex: `^${month}` },
    }).sort({ date: -1, createdAt: -1 }).lean();

    const habitIds = Array.from(new Set(checkins.map((c) => c.habitId)));
    const habitDocs = await Habit.find({ _id: { $in: habitIds } }).lean();
    const habitMap = new Map(habitDocs.map((h) => [h._id.toString(), h]));

    const data = checkins.map((c) => {
      const habit = habitMap.get(c.habitId);
      return {
        id: c._id.toString(),
        habitId: c.habitId,
        habitName: habit?.name || "已删除",
        habitIcon: habit?.icon || "⭐",
        habitColor: habit?.color || "#999",
        date: c.date,
        image: c.image || "",
        note: c.note || "",
        createdAt: c.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, error: "获取失败" }, { status: 500 });
  }
}

// DELETE /api/checkins?id=xxx
export async function DELETE(request: NextRequest) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });

  try {
    await connectDB();
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "缺少ID" }, { status: 400 });

    const result = await Checkin.findOneAndDelete({ _id: id, userId: user.userId });
    if (!result) return NextResponse.json({ success: false, error: "记录不存在" }, { status: 404 });

    return NextResponse.json({ success: true, message: "删除成功" });
  } catch {
    return NextResponse.json({ success: false, error: "删除失败" }, { status: 500 });
  }
}

// PATCH /api/checkins - update image/note on existing checkin
export async function PATCH(request: NextRequest) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });

  try {
    await connectDB();
    const { id, image, note } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: "缺少记录ID" }, { status: 400 });

    const updates: Record<string, string> = {};
    if (image !== undefined) updates.image = image;
    if (note !== undefined) updates.note = note;

    const updated = await Checkin.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { $set: updates },
      { new: true }
    );
    if (!updated) return NextResponse.json({ success: false, error: "记录不存在" }, { status: 404 });

    return NextResponse.json({ success: true, message: "更新成功" });
  } catch {
    return NextResponse.json({ success: false, error: "更新失败" }, { status: 500 });
  }
}