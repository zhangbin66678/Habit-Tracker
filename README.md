# 🌐 线上访问地址 (Live Demo)

**[点击直接访问在线项目](https://your-project.vercel.app)**
*(部署后替换为实际URL，支持PC端直接打开)*

---

# 📖 项目简介

本项目为基于 **AI 辅助编程（Vibe Coding）** 完成的全栈习惯打卡管理系统。用户可以创建每日习惯、一键完成打卡、查看近30天的数据统计与热力图，帮助养成良好习惯。

**核心功能：**
- **今日打卡**：展示所有习惯列表，点击即可完成/取消今日打卡，实时显示进度条
- **习惯管理**：新增（自定义名称/图标/颜色）、删除习惯，带输入校验
- **数据统计**：近30天打卡热力图、各习惯完成率、连续打卡天数

---

# 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | Next.js 14 / React 18 / TypeScript |
| **样式** | Tailwind CSS |
| **后端** | Next.js API Routes (Node.js) |
| **数据存储** | 本地 JSON 文件（零配置，Vercel 兼容） |
| **部署平台** | Vercel |

---

# 📂 项目目录结构

```
habit-tracker/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 首页 - 今日打卡
│   │   ├── layout.tsx            # 全局布局 + 导航栏
│   │   ├── globals.css           # 全局样式
│   │   ├── manage/
│   │   │   └── page.tsx          # 管理页 - 新增/删除习惯
│   │   ├── stats/
│   │   │   └── page.tsx          # 统计页 - 热力图/完成率
│   │   └── api/
│   │       ├── habits/
│   │       │   ├── route.ts      # API: GET获取列表 / POST创建 / DELETE删除
│   │       │   └── [id]/
│   │       │       └── checkin/
│   │       │           └── route.ts  # API: POST打卡/取消
│   │       └── stats/
│   │           └── route.ts      # API: GET统计原始数据
│   ├── components/
│   │   └── Navbar.tsx            # 底部导航栏组件
│   └── lib/
│       ├── types.ts              # TypeScript 类型定义
│       └── db.ts                 # JSON文件读写工具
├── data/
│   └── habits.json               # 习惯与打卡数据
├── docs/                         # 截图与相关附件
├── README.md                     # 本文件
├── prompt_log.md                 # AI 交互日志
├── API_DOCS.md                   # 接口文档
└── package.json
```

---

# 🚀 本地运行指南

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 打开浏览器

访问 http://localhost:3000

### 4. 构建生产版本

```bash
npm run build
npm start
```

---

# 📋 页面路由说明

| 路由 | 页面 | 功能描述 |
|------|------|----------|
| `/` | 今日打卡 | 展示习惯列表，点击完成打卡，显示今日进度 |
| `/manage` | 习惯管理 | 新增习惯（名称/图标/颜色选择），删除习惯 |
| `/stats` | 数据统计 | 30天打卡热力图、各习惯完成率、连续打卡天数 |

---

# 📸 功能截图

> 部署后请在此处补充截图：
> - `docs/home.png` - 首页打卡界面
> - `docs/manage.png` - 习惯管理界面
> - `docs/stats.png` - 数据统计界面
> - `docs/api_postman.png` - API 接口测试截图
> - `docs/code_review.png` - AI 代码审查截图
> - `docs/demo_video.mp4` - 项目演示录屏