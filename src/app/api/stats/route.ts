import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/stats - 获取所有习惯和打卡记录
export async function GET() {
  try {
    const [habits] = await pool.query(
      "SELECT id, name, color, icon, created_at AS createdAt FROM habits ORDER BY created_at DESC"
    );

    const [checkins] = await pool.query(
      "SELECT id, habit_id AS habitId, DATE_FORMAT(date, '%Y-%m-%d') AS date, created_at AS createdAt FROM checkins ORDER BY date DESC"
    );

    return NextResponse.json({
      success: true,
      data: {
        habits,
        checkins,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to read stats" },
      { status: 500 }
    );
  }
}