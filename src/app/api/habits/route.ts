import { NextRequest, NextResponse } from "next/server";
import { connectDB, Habit, Checkin, getTodayStr } from "@/lib/db";
import { verifyToken, extractToken } from "@/lib/auth";

// Helper: get authenticated user
function getUser(req: NextRequest): { userId: string } | NextResponse {
  const token = extractToken(req);
  if (!token) return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ success: false, error: "登录已过期" }, { status: 401 });
  return { userId: payload.userId };
}

// GET /api/habits
export async function GET(request: NextRequest) {
  const user = getUser(request);
  if (user instanceof NextResponse) return user;

  try {
    await connectDB();

    const today = getTodayStr();

    const habits = await Habit.find({ userId: user.userId }).sort({ createdAt: -1 }).lean();
    const checkins = await Checkin.find({ userId: user.userId, date: today }).select("habitId").lean();

    const checkedSet = new Set(checkins.map((c) => c.habitId));

    const habitsWithStatus = habits.map((h) => ({
      id: h._id.toString(),
      name: h.name,
      color: h.color,
      icon: h.icon,
      createdAt: h.createdAt.toISOString(),
      checkedToday: checkedSet.has(h._id.toString()),
    }));

    return NextResponse.json({ success: true, data: habitsWithStatus });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to read habits" }, { status: 500 });
  }
}

// POST /api/habits
export async function POST(request: NextRequest) {
  const user = getUser(request);
  if (user instanceof NextResponse) return user;

  try {
    await connectDB();

    const body = await request.json();
    const { name, color, icon } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ success: false, error: "习惯名称不能为空" }, { status: 400 });
    }
    if (name.trim().length > 50) {
      return NextResponse.json({ success: false, error: "习惯名称不能超过50个字符" }, { status: 400 });
    }

    const habit = await Habit.create({
      userId: user.userId,
      name: name.trim(),
      color: color || "#3B82F6",
      icon: icon || "⭐",
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: habit._id.toString(),
          name: habit.name,
          color: habit.color,
          icon: habit.icon,
          createdAt: habit.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create habit" }, { status: 500 });
  }
}

// PUT /api/habits - 编辑习惯
export async function PUT(request: NextRequest) {
  const user = getUser(request);
  if (user instanceof NextResponse) return user;

  try {
    await connectDB();

    const { id, name, color, icon } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "缺少习惯ID" }, { status: 400 });
    }

    const existing = await Habit.findOne({ _id: id, userId: user.userId });
    if (!existing) {
      return NextResponse.json({ success: false, error: "习惯不存在" }, { status: 404 });
    }

    if (name !== undefined) {
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ success: false, error: "习惯名称不能为空" }, { status: 400 });
      }
      if (name.trim().length > 50) {
        return NextResponse.json({ success: false, error: "习惯名称不能超过50个字符" }, { status: 400 });
      }
    }

    const updates: Record<string, string> = {};
    if (name !== undefined) updates.name = name.trim();
    if (color !== undefined) updates.color = color;
    if (icon !== undefined) updates.icon = icon;

    await Habit.findOneAndUpdate({ _id: id, userId: user.userId }, { $set: updates });

    return NextResponse.json({ success: true, message: "更新成功" });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update habit" }, { status: 500 });
  }
}

// DELETE /api/habits?id=xxx
export async function DELETE(request: NextRequest) {
  const user = getUser(request);
  if (user instanceof NextResponse) return user;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "缺少习惯ID" }, { status: 400 });
    }

    const existing = await Habit.findOne({ _id: id, userId: user.userId });
    if (!existing) {
      return NextResponse.json({ success: false, error: "习惯不存在" }, { status: 404 });
    }

    await Checkin.deleteMany({ userId: user.userId, habitId: id });
    await Habit.deleteOne({ _id: id, userId: user.userId });

    return NextResponse.json({ success: true, message: "删除成功" });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete habit" }, { status: 500 });
  }
}