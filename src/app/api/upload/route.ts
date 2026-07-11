import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { verifyToken, extractToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "未选择文件" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "仅支持 JPG/PNG/GIF/WebP 格式" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "图片大小不能超过5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}_${payload.userId}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "checkins");

    await writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/checkins/${filename}`;

    return NextResponse.json({ success: true, data: { url } });
  } catch {
    return NextResponse.json(
      { success: false, error: "上传失败" },
      { status: 500 }
    );
  }
}