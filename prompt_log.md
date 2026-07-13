# AI 交互日志 (Prompt Log)

## 记录 1：初始化项目架构与页面路由
- **日期**：2026-07-11
- **解决功能**：项目初始化、3个页面路由（首页/管理/统计）、基础UI组件
- **涉及文件**：`src/app/page.tsx`, `src/app/manage/page.tsx`, `src/app/stats/page.tsx`, `src/app/layout.tsx`
- **我的 Prompt**：
"帮我用 Next.js 14 写一个习惯打卡管理系统，前端要求样式美观好看（使用 Tailwind CSS），包含3个页面：首页打卡、习惯管理页面、数据统计页面。后端提供 API 接口用于增删查改。请生成完整代码结构。"
- **AI 返回要点**：
  - 创建了 Next.js 14 App Router 项目结构
  - 实现了3个页面的基础 UI 和组件
  - 使用 Tailwind CSS 实现移动端优先的响应式设计
  - 初始数据使用 JSON 文件存储

## 记录 2：对接 MySQL 数据库
- **日期**：2026-07-11
- **解决功能**：将 JSON 文件存储替换为 MySQL 数据库持久化
- **涉及文件**：`src/lib/db.ts`, `database/init.sql`, `src/app/api/habits/route.ts`
- **我的 Prompt**：
"把数据存储从 JSON 文件改成 MySQL 数据库，使用 mysql2 连接池，创建 habits 和 checkins 两张表。"
- **AI 返回要点**：
  - 安装 mysql2 依赖
  - 创建 database/init.sql 建表脚本（habits + checkins，含外键级联删除）
  - 重写 db.ts 为 mysql2/promise 连接池
  - 3个 API 接口全部改为 SQL 查询

## 记录 3：新增用户登录注册与打卡图片上传
- **日期**：2026-07-11
- **解决功能**：完整的用户系统（注册/登录/JWT鉴权）+ 打卡时上传图片
- **涉及文件**：`src/lib/auth.ts`, `src/contexts/AuthContext.tsx`, `src/app/login/page.tsx`, `src/app/register/page.tsx`, `src/app/api/auth/*/route.ts`, `src/app/api/upload/route.ts`
- **我的 Prompt**：
"增加登录注册功能，用 JWT 做鉴权。打卡的时候可以上传图片，最好还能加个文字备注。"
- **AI 返回要点**：
  - 安装 jsonwebtoken + bcryptjs
  - 创建 users 表，habits/checkins 加 user_id 外键
  - 实现 JWT 签发/验证，7天有效期
  - 图片上传到 public/uploads/checkins/，限制 5MB
  - 前端 AuthContext + 路由守卫

## 记录 4：新增历史记录页与交互健壮性优化
- **日期**：2026-07-12
- **解决功能**：历史记录按月查看、Toast 通知、确认弹窗、取消打卡二次确认
- **涉及文件**：`src/app/history/page.tsx`, `src/contexts/ToastContext.tsx`, `src/contexts/ConfirmContext.tsx`, `src/app/api/checkins/route.ts`
- **我的 Prompt**：
"感觉功能还是不具备健壮性，看看哪里可以优化的，比如历史记录啊之类的。"
- **AI 返回要点**：
  - 新增历史记录页 /history，按日期分组展示
  - 创建 Toast 全局通知组件（成功/错误/信息三种类型）
  - 创建 Confirm 确认弹窗组件（替代原生 confirm）
  - 首页取消打卡增加二次确认
  - 新增 GET/DELETE /api/checkins 接口

## 记录 5：集成 LangChain.js AI 智能体
- **日期**：2026-07-12
- **解决功能**：AI 助手根据用户习惯数据生成今日规划、习惯分析、激励语
- **涉及文件**：`src/lib/ai.ts`, `src/app/api/ai/plan/route.ts`, `src/app/api/ai/analyze/route.ts`, `src/app/api/ai/motivate/route.ts`
- **我的 Prompt**：
"使用 langchain.js 来制作一个智能体功能，读取个人习惯数据，自动生成日常规划或者提醒。"
- **AI 返回要点**：
  - 安装 langchain + @langchain/openai
  - 配置 GPT-4o-mini 模型
  - 3个 AI 接口：plan（今日规划）、analyze（习惯分析）、motivate（激励语）
  - 后端读取数据库组装 Prompt，前端展示 AI 结果
  - 每用户每日 3 次频率限制