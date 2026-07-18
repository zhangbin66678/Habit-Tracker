import { NextRequest, NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { verifyToken, extractToken } from "@/lib/auth";

// 简易限流
const dailyUsage: Record<string, number> = {};
let lastResetDate = "";

function checkRateLimit(userId: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (lastResetDate !== today) {
    Object.keys(dailyUsage).forEach((k) => delete dailyUsage[k]);
    lastResetDate = today;
  }
  dailyUsage[userId] = (dailyUsage[userId] || 0) + 1;
  return dailyUsage[userId] <= 10;
}

function getDailyCount(userId: string): number {
  const today = new Date().toISOString().slice(0, 10);
  if (lastResetDate !== today) return 0;
  return dailyUsage[userId] || 0;
}

export async function POST(request: NextRequest) {
  const token = extractToken(request);
  if (!token) return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ success: false, error: "登录已过期" }, { status: 401 });

  const { apiKey, userInput, targetDate, wakeTime, sleepTime } = await request.json();

  if (!apiKey || typeof apiKey !== "string") {
    return NextResponse.json({ success: false, error: "请先配置 API Key" }, { status: 400 });
  }

  if (!userInput || typeof userInput !== "string" || !userInput.trim()) {
    return NextResponse.json({ success: false, error: "请输入你想做的事情" }, { status: 400 });
  }

  if (!checkRateLimit(payload.userId)) {
    return NextResponse.json({
      success: false,
      error: "今日免费额度已用完,请明天再试",
      remaining: 0,
    }, { status: 429 });
  }

  try {
    const llm = new ChatOpenAI({
      apiKey: apiKey,
      modelName: "deepseek-chat",
      temperature: 0.7,
      maxTokens: 2048,
      configuration: {
        baseURL: "https://api.deepseek.com",
      },
    });

    const today = new Date().toISOString().slice(0, 10);

    const prompt = `你是一个专业的日程规划助手。请根据用户的描述,生成明天的详细日程安排。

【用户描述】
${userInput}

【基础信息】
- 目标日期: ${targetDate || today}
- 起床时间: ${wakeTime || "07:00"}
- 睡觉时间: ${sleepTime || "23:00"}

【输出要求】
严格按照以下 JSON 格式输出(不要有任何其他内容,不要用 markdown 代码块包裹):
{
  "summary": "整体规划思路的简短说明(50-100字)",
  "tasks": [
    {
      "id": "1",
      "time": "07:00",
      "title": "任务标题",
      "duration": 30,
      "description": "具体做什么的简短说明",
      "category": "work|health|study|life|social|rest",
      "priority": "high|medium|low"
    }
  ]
}

【约束】
1. 任务从起床时间开始,到睡觉时间结束
2. 至少安排 5 个任务,不超过 12 个
3. 任务之间要预留合理的过渡时间(吃饭、休息等)
4. 根据用户描述合理分配优先级
5. 每个任务的 duration 单位是分钟
6. category 必须是 work/health/study/life/social/rest 之一
7. priority 必须是 high/medium/low 之一
8. 时间格式必须是 HH:MM(24小时制)
9. 保持科学作息,避免熬夜`;

    const response = await llm.invoke([new HumanMessage(prompt)]);
    const content = response.content.toString().trim();

    // 解析 JSON(去掉可能存在的 markdown 包裹)
    let jsonStr = content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: { summary: string; tasks: any[] };
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({
        success: false,
        error: "AI 返回格式异常,请重试",
        raw: content,
      }, { status: 500 });
    }

    // 验证字段
    if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
      return NextResponse.json({ success: false, error: "AI 返回数据格式错误" }, { status: 500 });
    }

    // 补全 id 字段
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parsed.tasks = parsed.tasks.map((t: any, i: number) => ({
      id: t.id || String(i + 1),
      time: t.time || "08:00",
      title: t.title || "未命名任务",
      duration: Number(t.duration) || 30,
      description: t.description || "",
      category: ["work", "health", "study", "life", "social", "rest"].includes(t.category) ? t.category : "life",
      priority: ["high", "medium", "low"].includes(t.priority) ? t.priority : "medium",
    }));

    return NextResponse.json({
      success: true,
      data: {
        date: targetDate || today,
        summary: parsed.summary || "已为你生成明天的规划",
        tasks: parsed.tasks,
      },
      remaining: 10 - getDailyCount(payload.userId),
    });
  } catch (err: unknown) {
    console.error("[agent-plan] Error:", err);
    let msg = "AI 生成失败";
    if (err instanceof Error) {
      msg = err.message;
      // 更友好的错误提示
      if (msg.includes("401") || msg.includes("Unauthorized")) {
        msg = "API Key 无效或已过期,请检查 .env 中的 DEEPSEEK_API_KEY";
      } else if (msg.includes("429")) {
        msg = "DeepSeek API 调用频率超限,请稍后再试";
      } else if (msg.includes("ENOTFOUND") || msg.includes("ECONNREFUSED")) {
        msg = "无法连接到 DeepSeek API,请检查网络";
      }
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}