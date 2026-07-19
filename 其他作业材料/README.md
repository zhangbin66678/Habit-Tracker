# 习惯打卡系统 (Habit Tracker)

> 基于 AI 辅助编程(Vibe Coding) 打造的全栈习惯管理应用,集成 LangChain AI 助手、数据可视化和图片记录功能

![Tech](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38bdf8?logo=tailwind-css)
![LangChain](https://img.shields.io/badge/LangChain-AI-yellow?logo=langchain)

---

## 📖 项目介绍

### 项目简介

**习惯打卡系统** 是一个面向个人的全栈 Web 应用,旨在帮助用户养成良好的习惯。用户可以创建自己的习惯列表,每天进行打卡,上传图片记录,查看历史和统计信息,并通过 AI 助手获得个性化的行动规划、习惯分析和激励反馈。

### 🎯 项目亮点

- ✅ **完整的用户系统**:注册、登录、JWT 鉴权、路由守卫
- ✅ **直观的打卡体验**:一键打卡,支持图片上传和文字备注
- ✅ **丰富的可视化**:30天打卡热力图、完成率、连续天数、周报
- ✅ **AI 智能助手**:基于 LangChain.js + DeepSeek,提供今日规划、习惯分析、激励语
- ✅ **🆕 智能体规划**:告诉 AI 你明天想做什么,一键生成结构化日程(分类、优先级、时间)
- ✅ **完整的历史记录**:按月查看所有打卡记录,支持图片预览和单条删除
- ✅ **灵活的习惯管理**:自定义图标、颜色、重复计划(每天/仅一次/具体星期)
- ✅ **良好的交互体验**:全局 Toast 通知、自定义确认弹窗、取消打卡二次确认
- ✅ **完善的 API 文档**:Swagger UI 在线文档,可直接测试所有接口

### 🌟 核心功能

| 功能模块 | 说明 |
|---------|------|
| **用户认证** | 注册、登录、JWT Token 鉴权(7天有效期) |
| **今日打卡** | 展示所有习惯,点击完成/取消打卡,支持图片+备注 |
| **历史记录** | 按月查看打卡记录,图片预览,单条删除 |
| **数据统计** | 30天热力图、各习惯完成率、连续打卡天数、周完成率 |
| **习惯管理** | 新增/编辑/删除习惯,自定义名称/图标/颜色/时间 |
| **智能体规划** 🆕 | 输入"明天想做什么",AI 一键生成结构化日程(任务时间、优先级、分类) |
| **AI 助手** | 今日规划生成、7天习惯分析、个性化激励语 |
| **文件上传** | 打卡图片本地存储,支持 JPG/PNG/GIF/WebP |
| **API 文档** | Swagger UI 在线文档,17 个 RESTful 接口 |

### 📷 在线演示

部署到 Vercel 后可访问在线 Demo(部署后替换链接):
```
https://your-project.vercel.app
```

---

## 🛠️ 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 14.2 | React 全栈框架,使用 App Router |
| **React** | 18 | 用户界面库 |
| **TypeScript** | 5 | 类型安全的 JavaScript 超集 |
| **Tailwind CSS** | 3.4 | 原子化 CSS 框架 |
| **Swagger UI React** | latest | API 文档可视化 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js API Routes** | 14.2 | 服务端 API(基于 Node.js) |
| **Mongoose** | 9.x | MongoDB ODM |
| **MongoDB** | Atlas | 云数据库 |
| **JWT** | jsonwebtoken 9.x | 无状态身份认证 |
| **bcryptjs** | 3.x | 密码加密 |
| **Multer/FormData** | Native | 文件上传处理 |

### AI 能力

| 技术 | 用途 |
|------|------|
| **LangChain.js** | LLM 应用框架 |
| **@langchain/openai** | OpenAI 集成(实际使用 DeepSeek 模型) |
| **DeepSeek API** | 国产大模型 deepseek-chat,成本低、中文友好 |
| **Prompt Engineering** | 今日规划/习惯分析/激励语/智能体规划 提示词设计 |
| **结构化输出** | 智能体规划接口使用 JSON Schema 约束 AI 输出 |

### 工具链

| 技术 | 用途 |
|------|------|
| **ESLint** | 代码检查 |
| **PostCSS** | CSS 后处理 |
| **dotenv** | 环境变量管理 |

### 部署

| 平台 | 用途 |
|------|------|
| **Vercel** | Next.js 应用托管 |
| **MongoDB Atlas** | 云数据库(免费 M512 集群) |

---

## 📂 项目结构

```
vibe coding作业/
├── docs/                              # 📚 项目文档
│   ├── README.md                      # 本文件 - 项目介绍
│   ├── API.md                         # 完整 API 接口文档
│   └── prompt_log.md                  # AI 辅助编程日志
│
└── habit-tracker/                     # 🚀 主项目
    ├── src/
    │   ├── app/                       # Next.js App Router
    │   │   ├── layout.tsx             # 全局布局
    │   │   ├── globals.css            # 全局样式 + 动画
    │   │   ├── page.tsx               # 首页 - 今日打卡
    │   │   ├── login/page.tsx         # 登录页
    │   │   ├── register/page.tsx      # 注册页
    │   │   ├── history/page.tsx       # 历史记录
    │   │   ├── stats/page.tsx         # 数据统计
    │   │   ├── manage/page.tsx        # 习惯管理
    │   │   ├── agent/page.tsx         # 🆕 智能体规划(AI生成日程)
    │   │   ├── doc/page.tsx           # Swagger API 文档
    │   │   └── api/                   # 后端 API 路由
    │   │       ├── auth/              # 认证(register/login/me)
    │   │       ├── habits/            # 习惯 CRUD + 打卡
    │   │       ├── checkins/          # 打卡记录
    │   │       ├── stats/             # 统计数据
    │   │       ├── upload/            # 文件上传
    │   │       ├── ai/                # AI 助手
    │   │       │   ├── plan/          # 今日规划
    │   │       │   ├── analyze/       # 习惯分析
    │   │       │   ├── motivate/      # 激励语
    │   │       │   └── agent-plan/    # 🆕 智能体日程规划
    │   │       └── doc/               # OpenAPI 规范
    │   ├── components/                # 共享组件
    │   │   ├── Sidebar.tsx            # 侧边栏导航
    │   │   └── AuthGuard.tsx          # 路由守卫
    │   ├── contexts/                  # React Context
    │   │   ├── AuthContext.tsx        # 用户认证
    │   │   ├── ToastContext.tsx       # 全局通知
    │   │   └── ConfirmContext.tsx     # 确认弹窗
    │   └── lib/                       # 工具库
    │       ├── db.ts                  # MongoDB 连接 + Schema
    │       ├── auth.ts                # JWT 工具
    │       └── ai.ts                  # LangChain 配置
    ├── public/uploads/checkins/       # 打卡图片存储
    ├── .env.example                   # 环境变量模板
    ├── .env                           # 实际环境变量(不提交)
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── next.config.mjs
    ├── swagger.json                   # OpenAPI 3.0 规范
    └── README.md                      # 项目内的详细说明
```

---

## 🚀 安装和运行指南

### 📋 前置要求

在开始之前,请确保你的开发环境满足以下要求:

| 工具 | 最低版本 | 说明 |
|------|----------|------|
| **Node.js** | 18.17+ | [下载地址](https://nodejs.org/) |
| **npm** | 9+ | Node.js 自带,或使用 pnpm/yarn |
| **MongoDB** | 6.0+ | 本地安装或使用 Atlas 云服务 |
| **Git** | 2.0+ | 版本控制 |

### 🔧 安装步骤

#### 1️⃣ 克隆项目(如果是从 Git 仓库)

```bash
git clone <your-repo-url>
cd "vibe coding作业/habit-tracker"
```

#### 2️⃣ 安装依赖

```bash
npm install
```

或使用其他包管理器:

```bash
# 使用 pnpm
pnpm install

# 使用 yarn
yarn install
```

#### 3️⃣ 配置环境变量

**方式一:使用 MongoDB Atlas(推荐,免费)**

1. 注册 [MongoDB Atlas](https://www.mongodb.com/atlas/register) 账号
2. 创建一个免费 M512 集群
3. 在 **Database Access** 创建数据库用户并设置密码
4. 在 **Network Access** 添加 IP 白名单(开发可填 `0.0.0.0/0`)
5. 在集群页面点击 **Connect** → **Drivers** 获取连接字符串

创建 `.env` 文件:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS/Linux
cp .env.example .env
```

编辑 `.env` 文件:

```env
# MongoDB Atlas 连接字符串
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/habit_tracker?retryWrites=true&w=majority
```

**方式二:使用本地 MongoDB**

1. 从 [MongoDB 官网](https://www.mongodb.com/try/download/community) 下载并安装
2. 启动 MongoDB 服务:
   ```bash
   # Windows
   net start MongoDB

   # macOS
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod
   ```
3. `.env` 文件保持默认:
   ```env
   MONGODB_URI=mongodb://localhost:27017/habit_tracker
   ```

#### 4️⃣ 启动开发服务器

```bash
npm run dev
```

服务器启动后会显示:

```
  ▲ Next.js 14.2.35
  - Local:        http://localhost:3000
  - Environments: .env

 ✓ Ready in 3.2s
```

#### 5️⃣ 访问应用

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

- 首次使用请先点击 **注册** 创建账户
- 注册成功后会自动登录并跳转到首页

#### 6️⃣ (可选)配置 AI 功能

AI 助手和智能体规划功能需要 DeepSeek API Key:

1. 访问 [DeepSeek Platform](https://platform.deepseek.com/api_keys) 获取 API Key
2. 在应用中的 **AI 助手卡片** 或 **智能体规划** 页面点击 ⚙️ 齿轮图标
3. 输入 `sk-...` 开头的 API Key 并保存
4. 即可使用「今日规划」「习惯分析」「来点激励」和「智能体规划」功能
5. **注意**:
   - AI 助手接口(规划/分析/激励):每个用户每天限 **3 次** 免费调用
   - 智能体规划接口:每个用户每天限 **10 次** 免费调用(因为输出更长的 JSON)

---

### 📜 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器(热更新) |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 运行 ESLint 代码检查 |

---

### 🌐 部署到 Vercel

#### 1. 准备 Git 仓库

```bash
cd habit-tracker
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

#### 2. 在 Vercel 部署

1. 访问 [Vercel](https://vercel.com/) 并用 GitHub 登录
2. 点击 **New Project** → 导入你的 GitHub 仓库
3. **Root Directory** 设置为 `habit-tracker`
4. 在 **Environment Variables** 添加:
   - `MONGODB_URI`:你的 MongoDB Atlas 连接字符串
5. 点击 **Deploy**

部署完成后即可通过 Vercel 提供的域名访问。

---

## 📖 使用指南

### 页面导航

| 路由 | 页面 | 功能 |
|------|------|------|
| `/register` | 注册 | 创建新账户 |
| `/login` | 登录 | 用户名+密码登录 |
| `/` | 今日打卡 | 完成今日所有习惯 |
| `/agent` | 🆕 智能体规划 | AI 一键生成明日日程 |
| `/history` | 历史记录 | 按月查看历史打卡 |
| `/stats` | 数据统计 | 可视化分析 + AI |
| `/manage` | 习惯管理 | 增删改查习惯 |
| `/doc` | API 文档 | Swagger UI(17 个接口) |

### 典型使用流程

1. **注册账户** → 访问 `/register` 创建账号
2. **添加习惯** → 进入「习惯管理」→ 「+ 新增」→ 填写名称/选图标/选颜色 → 创建
3. **每日打卡** → 在「今日打卡」页面点击习惯即可打卡,支持添加图片和备注
4. **🆕 智能规划明日** → 在「智能体规划」描述明天想做什么,AI 一键生成日程
5. **查看统计** → 进入「数据统计」查看完成率、热力图、连续天数
6. **使用 AI 助手** → 在 AI 助手卡片配置 API Key,获取个性化建议

---

## 📚 文档导航

| 文档 | 说明 |
|------|------|
| [API.md](file:///c:/Users/qinqin/Desktop/vibe%20coding作业/docs/API.md) | 完整的 API 接口文档(16个接口) |
| [Swagger UI](http://localhost:3000/doc) | 启动服务后可访问的交互式 API 文档 |
| [prompt_log.md](file:///c:/Users/qinqin/Desktop/vibe%20coding作业/docs/prompt_log.md) | AI 辅助编程交互日志 |
| [个人实训总结报告.md](file:///c:/Users/qinqin/Desktop/vibe%20coding作业/habit-tracker/%E4%B8%AA%E4%BA%BA%E5%AE%9E%E8%AE%AD%E6%80%BB%E7%BB%93%E6%8A%A5%E5%91%8A.md) | 实训总结 |

---

## 🐛 常见问题

### Q1: 启动时提示 `ENOENT: no such file or directory, open 'package.json'`

**A**: 请在 `habit-tracker` 目录下运行命令:
```bash
cd habit-tracker
npm run dev
```

### Q2: 注册时返回 500 错误

**A**: 通常是 MongoDB 连接问题:
1. 检查 `.env` 文件是否存在且 `MONGODB_URI` 配置正确
2. 确认 MongoDB Atlas 的 **Network Access** 允许你的 IP
3. 重启开发服务器

### Q3: AI 功能返回 500 错误

**A**: 
1. 确认已正确配置 DeepSeek API Key(以 `sk-` 开头)
2. 检查 API Key 是否有余额
3. AI 助手接口每日 3 次免费额度,智能体规划每日 10 次额度,用完后需等到次日

### Q4: 图片上传失败

**A**:
- 检查文件格式(JPG/PNG/GIF/WebP)
- 文件大小不超过 5MB
- 确认 `public/uploads/checkins/` 目录可写

### Q5: 历史/统计页面数据为 0

**A**: 
- 需要先在「习惯管理」创建习惯
- 然后在「今日打卡」页面完成打卡
- 数据会自动同步到历史和统计页面

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request!

### 开发规范

- 遵循 TypeScript 严格模式
- 使用 ESLint 保持代码风格一致
- 提交前运行 `npm run lint` 检查
- 重要功能更新请同步更新文档

### 提交规范

使用语义化提交信息:
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档变更
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具变更

---

## 📄 许可证

本项目仅用于学习和实训用途。

---

## 🙏 致谢

- [Next.js](https://nextjs.org/) - 强大的 React 全栈框架
- [MongoDB Atlas](https://www.mongodb.com/atlas) - 免费的云数据库
- [LangChain](https://langchain.com/) - LLM 应用开发框架
- [Tailwind CSS](https://tailwindcss.com/) - 优雅的 CSS 框架
- [Vercel](https://vercel.com/) - 优秀的部署平台

---

<div align="center">

**⭐ 如果这个项目对你有帮助,请给个 Star! ⭐**

Made with ❤️ using AI-Assisted Programming (Vibe Coding)

</div>
