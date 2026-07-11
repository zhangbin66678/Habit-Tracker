import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      "SELECT id, username, password, avatar, created_at FROM users WHERE username = ?",
      [username.trim()]
    );

    const users = rows as Array<{
      id: string;
      username: string;
      password: string;
      avatar: string;
      created_at: string;
    }>;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return NextResponse.json(
        { success: false, error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    const token = signToken({ userId: user.id, username: user.username });

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "登录失败" },
      { status: 500 }
    );
  }
}