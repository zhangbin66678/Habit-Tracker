# Habit Tracker - 每日习惯打卡管理系统

### 🌐 线上访问地址 (Live Demo)

**[点击直接访问在线项目](https://your-project.vercel.app)**

*(部署后替换为实际URL，支持PC端直接打开，无需本地编译)*

---

### 📖 项目简介

本项目为基于 **AI 辅助编程（Vibe Coding）** 完成的全栈习惯打卡管理系统。系统实现了完整的用户认证、习惯 CRUD、打卡记录管理、图片上传、数据统计可视化以及基于 LangChain.js 的 AI 智能体功能。用户可以创建个人习惯、每日打卡并上传图片记录、查看历史与统计数据，AI 助手还能根据个人数据自动生成今日规划和激励语。

**核心功能：**
- **用户系统**：注册、登录、JWT 鉴权、路由守卫
- **今日打卡**：展示所有习惯，点击完成/取消打卡，支持上传打卡图片和文字备注
- **历史记录**：按月查看所有打卡记录，支持图片预览和单条删除
- **数据统计**：30天打卡热力图、各习惯完成率、连续打卡天数、周报概览、打卡照片墙
- **习惯管理**：新增、编辑、删除习惯，自定义名称/图标/颜色
- **AI 智能体**：基于 LangChain.js + GPT-4o-mini，支持今日规划生成、习惯分析报告、激励语生成
- **交互体验**：全局 Toast 通知、自定义确认弹窗、取消打卡二次确认

### 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| **前端框架** | Next.js 14 (App Router) / React 18 / TypeScript |
| **UI 样式** | Tailwind CSS |
| **后端接口** | Next.js API Routes (Node.js) |
| **数据库** | MongoDB (Mongoose ODM) |
| **用户认证** | JWT (jsonwebtoken) + bcryptjs 密码加密 |
| **AI 智能体** | LangChain.js + @langchain/openai (GPT-4o-mini) |
| **文件上传** | 本地文件系统 (public/uploads/) |
| **部署平台** | Vercel + MongoDB Atlas |

### 📂 项目目录结构

```
habit-tracker/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 全局布局（Server Component）
│   │   ├── globals.css             # 全局样式 + 动画
│   │   ├── page.tsx                # 首页 - 今日打卡（左右分栏）
│   │   ├── login/page.tsx          # 登录页
│   │   ├── register/page.tsx       # 注册页
│   │   ├── history/page.tsx        # 历史记录页（按月分组）
│   │   ├── stats/page.tsx          # 数据统计页（双栏 + AI助手）
│   │   ├── manage/page.tsx         # 习惯管理页（CRUD）
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts      # POST 用户登录
│   │       │   ├── register/route.ts   # POST 用户注册
│   │       │   └── me/route.ts         # GET 当前用户信息
│   │       ├── habits/
│   │       │   ├── route.ts            # GET/POST/PUT/DELETE 习惯
│   │       │   └── [id]/checkin/route.ts  # POST 打卡/取消
│   │       ├── checkins/route.ts       # GET/DELETE 历史打卡记录
│   │       ├── stats/route.ts          # GET 统计数据
│   │       ├── upload/route.ts         # POST 图片上传
│   │       └── ai/
│   │           ├── plan/route.ts       # POST AI今日规划
│   │           ├── analyze/route.ts    # POST AI习惯分析
│   │           └── motivate/route.ts   # POST AI激励语
│   ├── components/
│   │   ├── Sidebar.tsx            # 侧边栏导航组件
│   │   └── AuthGuard.tsx          # 路由守卫组件
│   ├── contexts/
│   │   ├── AuthContext.tsx        # 用户认证上下文
│   │   ├── ToastContext.tsx       # 全局通知上下文
│   │   └── ConfirmContext.tsx     # 确认弹窗上下文
│   └── lib/
│       ├── db.ts                 # Mongoose 连接 + Schema + Model
│       ├── auth.ts               # JWT 签发/验证工具
│       └── ai.ts                 # LangChain 配置与频率限制
├── docs/                           # 截图与附件
├── public/uploads/checkins/        # 打卡图片上传目录
├── README.md                       # 本文件
├── API_DOCS.md                     # API 接口文档
├── prompt_log.md                   # AI 交互日志
├── 个人实训总结报告.docx            # 个人总结报告
├── .env.example                    # 环境变量示例
└── package.json
```

### 🚀 本地运行指南

#### 1. 安装依赖

```bash
npm install
```

#### 2. 配置数据库

- 在 [MongoDB Atlas](https://www.mongodb.com/atlas) 创建免费集群（M512）
- 创建数据库用户，获取连接字符串
- 复制环境变量配置文件并修改：

```bash
cp .env.example .env.local
# 将 .env.local 中的 MONGODB_URI 替换为你的 Atlas 连接字符串
```

#### 3. 启动开发服务器

```bash
npm run dev
```

#### 4. 打开浏览器

访问 http://localhost:3000 ，先注册账户再使用。

#### 5. AI 功能（可选）

在统计页或首页的 AI 助手卡片中，点击齿轮图标配置 OpenAI API Key（`sk-...`），即可使用今日规划、习惯分析、激励语功能。

### 📋 页面路由说明

| 路由 | 页面 | 功能描述 |
|------|------|----------|
| `/login` | 登录 | 用户名+密码登录，JWT 签发 |
| `/register` | 注册 | 用户名+密码+确认密码，bcrypt 加密 |
| `/` | 今日打卡 | 左右分栏，进度条+习惯列表+AI助手 |
| `/history` | 历史记录 | 按月分组查看打卡详情，含图片/笔记 |
| `/stats` | 数据统计 | 双栏布局，热力图+完成率+周报+AI分析 |
| `/manage` | 习惯管理 | 新增/编辑/删除习惯，图标颜色选择 |

### 📸 功能截图

> 部署后请补充以下截图到 `docs/` 目录：
> - `docs/api_postman.png` - API 接口测试截图
> - `docs/code_review.png` - AI 代码审查截图
> - `docs/demo_video.mp4` - 项目演示录屏（1-2分钟）