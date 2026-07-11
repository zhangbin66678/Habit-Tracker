import { NextRequest, NextResponse } from "next/server";
import pool, { generateId, getTodayStr } from "@/lib/db";
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
    const [rows] = await pool.query(
      "SELECT id FROM habits WHERE id = ? AND user_id = ?",
      [habitId, payload.userId]
    );
    if (!(rows as Array<unknown>).length) {
      return NextResponse.json({ success: false, error: "习惯不存在" }, { status: 404 });
    }

    const today = getTodayStr();
    const body = await request.json().catch(() => ({}));
    const { image, note } = body as { image?: string; note?: string };

    const [existing] = await pool.query(
      "SELECT id FROM checkins WHERE user_id = ? AND habit_id = ? AND date = ?",
      [payload.userId, habitId, today]
    );

    if ((existing as Array<unknown>).length > 0) {
      await pool.query(
        "DELETE FROM checkins WHERE user_id = ? AND habit_id = ? AND date = ?",
        [payload.userId, habitId, today]
      );
      return NextResponse.json({ success: true, checked: false, message: "已取消今日打卡" });
    }

    const id = generateId();
    await pool.query(
      "INSERT INTO checkins (id, habit_id, user_id, date, image, note) VALUES (?, ?, ?, ?, ?, ?)",
      [id, habitId, payload.userId, today, image || "", note || ""]
    );

    return NextResponse.json({
      success: true,
      checked: true,
      data: { id, habitId, date: today, image: image || "", createdAt: new Date().toISOString() },
      message: "打卡成功",
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to check in" }, { status: 500 });
  }
}