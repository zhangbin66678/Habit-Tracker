import { NextRequest, NextResponse } from "next/server";
import { readData, writeData, generateId, getTodayStr } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const habitId = params.id;

    if (!habitId) {
      return NextResponse.json(
        { success: false, error: "缺少习惯ID" },
        { status: 400 }
      );
    }

    const data = readData();
    const habit = data.habits.find((h) => h.id === habitId);

    if (!habit) {
      return NextResponse.json(
        { success: false, error: "习惯不存在" },
        { status: 404 }
      );
    }

    const today = getTodayStr();

    // Check if already checked in today
    const existingCheckin = data.checkins.find(
      (c) => c.habitId === habitId && c.date === today
    );

    if (existingCheckin) {
      // Undo checkin (toggle behavior)
      data.checkins = data.checkins.filter((c) => c.id !== existingCheckin.id);
      writeData(data);
      return NextResponse.json({
        success: true,
        checked: false,
        message: "已取消今日打卡",
      });
    }

    // Create new checkin
    const newCheckin = {
      id: generateId(),
      habitId,
      date: today,
      createdAt: new Date().toISOString(),
    };

    data.checkins.push(newCheckin);
    writeData(data);

    return NextResponse.json({
      success: true,
      checked: true,
      data: newCheckin,
      message: "打卡成功",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to check in" },
      { status: 500 }
    );
  }
}