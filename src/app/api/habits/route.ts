import { NextRequest, NextResponse } from "next/server";
import pool, { generateId, getTodayStr } from "@/lib/db";

// GET /api/habits - 获取所有习惯及今日打卡状态
export async function GET() {
  try {
    const today = getTodayStr();

    const [habits] = await pool.query(
      "SELECT id, name, color, icon, created_at AS createdAt FROM habits ORDER BY created_at DESC"
    );

    const [checkins] = await pool.query(
      "SELECT habit_id FROM checkins WHERE date = ?",
      [today]
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
    return NextResponse.json(
      { success: false, error: "Failed to read habits" },
      { status: 500 }
    );
  }
}

// POST /api/habits - 创建新习惯
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, color, icon } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "习惯名称不能为空" },
        { status: 400 }
      );
    }

    if (name.trim().length > 50) {
      return NextResponse.json(
        { success: false, error: "习惯名称不能超过50个字符" },
        { status: 400 }
      );
    }

    const id = generateId();
    await pool.query(
      "INSERT INTO habits (id, name, color, icon) VALUES (?, ?, ?, ?)",
      [id, name.trim(), color || "#3B82F6", icon || "⭐"]
    );

    const newHabit = {
      id,
      name: name.trim(),
      color: color || "#3B82F6",
      icon: icon || "⭐",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: newHabit }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create habit" },
      { status: 500 }
    );
  }
}

// DELETE /api/habits?id=xxx - 删除习惯
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "缺少习惯ID" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query("SELECT id FROM habits WHERE id = ?", [id]);

    if (!(rows as Array<unknown>).length) {
      return NextResponse.json(
        { success: false, error: "习惯不存在" },
        { status: 404 }
      );
    }

    // ON DELETE CASCADE 会自动删除关联的 checkins
    await pool.query("DELETE FROM habits WHERE id = ?", [id]);

    return NextResponse.json({ success: true, message: "删除成功" });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete habit" },
      { status: 500 }
    );
  }
}