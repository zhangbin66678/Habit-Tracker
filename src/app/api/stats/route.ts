import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken, extractToken } from "@/lib/auth";

// GET /api/stats
export async function GET(request: NextRequest) {
  const token = extractToken(request);
  if (!token) return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ success: false, error: "登录已过期" }, { status: 401 });

  try {
    const [habits] = await pool.query(
      "SELECT id, name, color, icon, created_at AS createdAt FROM habits WHERE user_id = ? ORDER BY created_at DESC",
      [payload.userId]
    );

    const [checkins] = await pool.query(
      "SELECT id, habit_id AS habitId, DATE_FORMAT(date, '%Y-%m-%d') AS date, image, note, created_at AS createdAt FROM checkins WHERE user_id = ? ORDER BY date DESC",
      [payload.userId]
    );

    return NextResponse.json({ success: true, data: { habits, checkins } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to read stats" }, { status: 500 });
  }
}