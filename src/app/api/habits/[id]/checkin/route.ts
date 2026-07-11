import { NextRequest, NextResponse } from "next/server";
import pool, { generateId, getTodayStr } from "@/lib/db";

// POST /api/habits/[id]/checkin - 打卡/取消打卡
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const habitId = params.id;

    if (!habitId) {
      return NextResponse.json(
        { success: false, error: "缺少习惯ID" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query("SELECT id FROM habits WHERE id = ?", [
      habitId,
    ]);

    if (!(rows as Array<unknown>).length) {
      return NextResponse.json(
        { success: false, error: "习惯不存在" },
        { status: 404 }
      );
    }

    const today = getTodayStr();

    // Check if already checked in today
    const [existing] = await pool.query(
      "SELECT id FROM checkins WHERE habit_id = ? AND date = ?",
      [habitId, today]
    );

    if ((existing as Array<unknown>).length > 0) {
      // Undo checkin
      await pool.query(
        "DELETE FROM checkins WHERE habit_id = ? AND date = ?",
        [habitId, today]
      );
      return NextResponse.json({
        success: true,
        checked: false,
        message: "已取消今日打卡",
      });
    }

    // Create new checkin
    const id = generateId();
    await pool.query(
      "INSERT INTO checkins (id, habit_id, date) VALUES (?, ?, ?)",
      [id, habitId, today]
    );

    return NextResponse.json({
      success: true,
      checked: true,
      data: {
        id,
        habitId,
        date: today,
        createdAt: new Date().toISOString(),
      },
      message: "打卡成功",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to check in" },
      { status: 500 }
    );
  }
}