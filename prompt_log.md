# AI 交互日志 (Prompt Log)

本文件记录了使用 AI 辅助工具（Trae）完成本项目开发的关键对话过程。

---

## 记录 1：项目初始化与基础架构搭建

* **解决功能**：使用 `create-next-app` 初始化 Next.js 14 项目，配置 TypeScript + Tailwind CSS
* **我的 Prompt**：
  > "帮我用 Next.js 14 写一个习惯打卡管理系统，前端要求样式美观好看（使用 Tailwind CSS），包含 3 个页面：今日打卡首页、习惯管理页面、数据统计页面。后端提供 3 个 API 接口用于增删查改。请生成完整代码结构。"
* **AI 返回核心内容**：
  - 使用 `npx create-next-app@14 habit-tracker --typescript --tailwind` 初始化项目
  - 确定了项目目录结构：`src/app/` 下 3 个路由 + `src/app/api/` 下 3 个接口
  - 推荐使用本地 JSON 文件作为数据存储方案，免去数据库配置

---

## 记录 2：数据层设计与 API 接口实现

* **解决功能**：`src/lib/types.ts`（类型定义）、`src/lib/db.ts`（JSON 读写）、3个 API Route
* **我的 Prompt**：
  > "帮我设计数据模型和3个API接口：1) GET /api/habits 获取所有习惯及今日打卡状态；2) POST /api/habits 创建新习惯（带输入校验）；3) POST /api/habits/:id/checkin 打卡/取消打卡。数据用本地JSON文件存储。"
* **AI 返回核心内容**：
  - 定义了 `Habit`、`Checkin`、`HabitData` 三个 TypeScript 接口
  - 实现了 `readData()` / `writeData()` / `generateId()` 工具函数
  - 3个API均包含完整的参数校验（空值检查、长度限制、404处理）
  - 打卡接口采用 Toggle 设计，同一天重复点击可取消

---

## 记录 3：首页（今日打卡页面）开发

* **解决功能**：`src/app/page.tsx` - 今日习惯列表、一键打卡、进度条展示
* **我的 Prompt**：
  > "帮我写首页组件，调用 GET /api/habits 获取习惯列表，展示每个习惯的卡片（图标+名称+打卡按钮），顶部显示今日进度百分比和进度条。打卡后实时更新UI状态，不需要刷新页面。"
* **AI 返回核心内容**：
  - 使用 `useState` + `useCallback` 管理状态和数据获取
  - 打卡按钮点击后调用 API，根据返回的 `checked` 字段更新本地状态
  - 进度条使用 `bg-gradient-to-r` 渐变色，宽度通过 `style={{ width }}` 动态设置
  - 加载状态使用 `animate-spin` 旋转动画

---

## 记录 4：管理页面开发

* **解决功能**：`src/app/manage/page.tsx` - 新增习惯表单（名称+图标+颜色选择）、删除习惯
* **我的 Prompt**：
  > "帮我写习惯管理页面，需要：1) 新增按钮展开表单，包含名称输入框（限50字）、12个Emoji图标选择、8种颜色选择；2) 实时预览效果；3) 删除按钮带确认弹窗。样式用 Tailwind CSS 圆角卡片风格。"
* **AI 返回核心内容**：
  - 表单使用 `showForm` 状态控制展开/收起
  - 图标和颜色使用 `flex-wrap` 网格布局，选中态用 `border-blue-500` 高亮
  - 输入框实时显示字数计数 `name.length/50`
  - 删除前使用 `confirm()` 弹窗确认

---

## 记录 5：统计页面开发

* **解决功能**：`src/app/stats/page.tsx` - 30天热力图、各习惯完成率柱状条、连续打卡天数
* **我的 Prompt**：
  > "帮我写数据统计页面，需要：1) 顶部3个数字卡片（习惯数/总打卡/全勤天数）；2) 30天打卡热力图（类似GitHub贡献图，用绿色深浅表示）；3) 各习惯完成率进度条和连续打卡天数。数据从 /api/stats 获取真实的打卡记录来计算。"
* **AI 返回核心内容**：
  - 使用 `getLastNDays()` 生成近30天日期数组
  - 热力图根据打卡比例分4档颜色（gray/green-200/green-400/green-600）
  - 连续打卡天数从今天往前逐天检查，支持"今天或昨天开始"的容错
  - 使用 `Set` 数据结构构建 `checkinMap` 快速查找