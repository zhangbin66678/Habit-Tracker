import { NextRequest, NextResponse } from "next/server";
import { readData, writeData, generateId } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, color, icon } = body;

    // Input validation
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

    const data = readData();
    const newHabit = {
      id: generateId(),
      name: name.trim(),
      color: color || "#3B82F6",
      icon: icon || "⭐",
      createdAt: new Date().toISOString(),
    };

    data.habits.push(newHabit);
    writeData(data);

    return NextResponse.json({ success: true, data: newHabit }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create habit" },
      { status: 500 }
    );
  }
}

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

    const data = readData();
    const habitExists = data.habits.some((h) => h.id === id);

    if (!habitExists) {
      return NextResponse.json(
        { success: false, error: "习惯不存在" },
        { status: 404 }
      );
    }

    data.habits = data.habits.filter((h) => h.id !== id);
    data.checkins = data.checkins.filter((c) => c.habitId !== id);
    writeData(data);

    return NextResponse.json({ success: true, message: "删除成功" });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete habit" },
      { status: 500 }
    );
  }
}