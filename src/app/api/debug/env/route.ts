import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  return NextResponse.json({
    keyExists: !!apiKey,
    keyLength: apiKey?.length || 0,
    keyPrefix: apiKey?.substring(0, 10) || "empty",
    // 不要在响应中暴露完整的 API Key
  });
}