import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken, extractToken } from "@/lib/auth";

// GET /api/checkins?month=2026-07
export async function GET(request: NextRequest) {
  const token = extractToken(request);
  if (!token) return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ success: false, error: "登录已过期" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // e.g. "2026-07"

    let dateFilter = "";
    const params: unknown[] = [payload.userId];

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      dateFilter = "AND DATE_FORMAT(c.date, '%Y-%m') = ?";
      params.push(month);
    }

    const [rows] = await pool.query(
      `SELECT c.id, c.habit_id AS habitId, h.name AS habitName, h.icon AS habitIcon, h.color AS habitColor,
              DATE_FORMAT(c.date, '%Y-%m-%d') AS date, c.image, c.note, c.created_at AS createdAt
       FROM checkins c
       JOIN habits h ON c.habit_id = h.id
       WHERE c.user_id = ? ${dateFilter}
       ORDER BY c.date DESC, c.created_at DESC`,
      params
    );

    return NextResponse.json({ success: true, data: rows });
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "缺少记录ID" }, { status: 400 });

    const [rows] = await pool.query("SELECT id FROM checkins WHERE id = ? AND user_id = ?", [id, payload.userId]);
    if (!(rows as Array<unknown>).length) {
      return NextResponse.json({ success: false, error: "记录不存在" }, { status: 404 });
    }

    await pool.query("DELETE FROM checkins WHERE id = ? AND user_id = ?", [id, payload.userId]);
    return NextResponse.json({ success: true, message: "删除成功" });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete checkin" }, { status: 500 });
  }
}