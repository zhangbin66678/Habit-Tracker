import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB, User } from "@/lib/db";
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

    await connectDB();

    const existing = await User.findOne({ username: username.trim() });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "用户名已存在" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.trim(),
      password: hashedPassword,
    });

    const token = signToken({ userId: user._id.toString(), username: username.trim() });

    return NextResponse.json(
      {
        success: true,
        data: {
          token,
          user: { id: user._id.toString(), username: username.trim(), avatar: "" },
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