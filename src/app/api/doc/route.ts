import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

/**
 * @swagger
 * /api/doc:
 *   get:
 *     summary: 获取 Swagger API 文档
 *     description: 返回 OpenAPI 规范的 JSON 文档
 *     responses:
 *       200:
 *         description: OpenAPI 规范文档
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export async function GET() {
  try {
    const swaggerPath = path.join(process.cwd(), "swagger.json");
    const swaggerContent = fs.readFileSync(swaggerPath, "utf-8");
    const swaggerJson = JSON.parse(swaggerContent);

    return NextResponse.json(swaggerJson);
  } catch (error) {
    console.error("Failed to load Swagger documentation:", error);
    return NextResponse.json(
      { error: "Failed to load Swagger documentation" },
      { status: 500 }
    );
  }
}