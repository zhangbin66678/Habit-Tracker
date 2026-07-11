import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool, { generateId } from "@/lib/db";
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

    if (username.trim().length < 2 || username.trim().length > 30) {
      return NextResponse.json(
        { success: false, error: "用户名长度为2-30个字符" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "密码至少6个字符" },
        { status: 400 }
      );
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE username = ?",
      [username.trim()]
    );

    if ((existing as Array<unknown>).length > 0) {
      return NextResponse.json(
        { success: false, error: "用户名已存在" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = generateId();

    await pool.query(
      "INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
      [id, username.trim(), hashedPassword]
    );

    const token = signToken({ userId: id, username: username.trim() });

    return NextResponse.json(
      {
        success: true,
        data: {
          token,
          user: { id, username: username.trim(), avatar: "" },
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "注册失败" },
      { status: 500 }
    );
  }
}