import { NextRequest, NextResponse } from "next/server";
import pool, { generateId, getTodayStr } from "@/lib/db";
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
    const today = getTodayStr();

    const [habits] = await pool.query(
      "SELECT id, name, color, icon, created_at AS createdAt FROM habits WHERE user_id = ? ORDER BY created_at DESC",
      [user.userId]
    );

    const [checkins] = await pool.query(
      "SELECT habit_id FROM checkins WHERE user_id = ? AND date = ?",
      [user.userId, today]
    );

    const checkedSet = new Set(
      (checkins as Array<{ habit_id: string }>).map((c) => c.habit_id)
    );

    const habitsWithStatus = (habits as Array<Record<string, unknown>>).map(
      (h) => ({
        ...h,
        checkedToday: checkedSet.has(h.id as string),
      })
    );

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
    const body = await request.json();
    const { name, color, icon } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ success: false, error: "习惯名称不能为空" }, { status: 400 });
    }
    if (name.trim().length > 50) {
      return NextResponse.json({ success: false, error: "习惯名称不能超过50个字符" }, { status: 400 });
    }

    const id = generateId();
    await pool.query(
      "INSERT INTO habits (id, user_id, name, color, icon) VALUES (?, ?, ?, ?, ?)",
      [id, user.userId, name.trim(), color || "#3B82F6", icon || "⭐"]
    );

    return NextResponse.json(
      { success: true, data: { id, name: name.trim(), color: color || "#3B82F6", icon: icon || "⭐", createdAt: new Date().toISOString() } },
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
    const { id, name, color, icon } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "缺少习惯ID" }, { status: 400 });
    }

    const [rows] = await pool.query("SELECT id FROM habits WHERE id = ? AND user_id = ?", [id, user.userId]);
    if (!(rows as Array<unknown>).length) {
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

    await pool.query(
      "UPDATE habits SET name = COALESCE(?, name), color = COALESCE(?, color), icon = COALESCE(?, icon) WHERE id = ? AND user_id = ?",
      [name?.trim() || null, color || null, icon || null, id, user.userId]
    );

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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "缺少习惯ID" }, { status: 400 });
    }

    const [rows] = await pool.query("SELECT id FROM habits WHERE id = ? AND user_id = ?", [id, user.userId]);
    if (!(rows as Array<unknown>).length) {
      return NextResponse.json({ success: false, error: "习惯不存在" }, { status: 404 });
    }

    await pool.query("DELETE FROM habits WHERE id = ? AND user_id = ?", [id, user.userId]);
    return NextResponse.json({ success: true, message: "删除成功" });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete habit" }, { status: 500 });
  }
}