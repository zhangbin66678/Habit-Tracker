import { ChatOpenAI } from "@langchain/openai";

// Rate limiting: userId -> count
const dailyUsage: Record<string, number> = {};
let lastResetDate = "";

function checkRateLimit(userId: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (lastResetDate !== today) {
    Object.keys(dailyUsage).forEach((k) => delete dailyUsage[k]);
    lastResetDate = today;
  }
  dailyUsage[userId] = (dailyUsage[userId] || 0) + 1;
  return dailyUsage[userId] <= 3;
}

export function getDailyCount(userId: string): number {
  const today = new Date().toISOString().slice(0, 10);
  if (lastResetDate !== today) return 0;
  return dailyUsage[userId] || 0;
}

export function createLLM(apiKey: string) {
  return new ChatOpenAI({
    openAIApiKey: apiKey,
    modelName: "gpt-4o-mini",
    temperature: 0.8,
    maxTokens: 500,
  });
}

export { checkRateLimit };