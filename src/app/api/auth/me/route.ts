import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken, extractToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "登录已过期" },
        { status: 401 }
      );
    }

    const [rows] = await pool.query(
      "SELECT id, username, avatar, created_at FROM users WHERE id = ?",
      [payload.userId]
    );

    const users = rows as Array<unknown>;
    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: "用户不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: users[0] });
  } catch {
    return NextResponse.json(
      { success: false, error: "获取用户信息失败" },
      { status: 500 }
    );
  }
}