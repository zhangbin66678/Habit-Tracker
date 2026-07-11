import { NextResponse } from "next/server";
import { readData } from "@/lib/db";

export async function GET() {
  try {
    const data = readData();
    return NextResponse.json({
      success: true,
      data: {
        habits: data.habits,
        checkins: data.checkins,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to read stats" },
      { status: 500 }
    );
  }
}