# 习惯打卡系统 API 文档

> 基于 Next.js 14 + MongoDB + LangChain 构建的习惯追踪应用后端 API 文档
>
> **基础URL**: `http://localhost:3000`
>
> **认证方式**: 除注册、登录外,所有接口均需在请求头携带 `Authorization: Bearer <token>`

---

## 目录

- [通用说明](#通用说明)
- [认证模块](#认证模块)
  - [用户注册](#1-用户注册)
  - [用户登录](#2-用户登录)
  - [获取当前用户信息](#3-获取当前用户信息)
- [习惯管理模块](#习惯管理模块)
  - [获取习惯列表](#4-获取习惯列表)
  - [创建新习惯](#5-创建新习惯)
  - [更新习惯](#6-更新习惯)
  - [删除习惯](#7-删除习惯)
- [打卡模块](#打卡模块)
  - [习惯打卡](#8-习惯打卡)
  - [获取打卡记录](#9-获取打卡记录)
  - [更新打卡记录](#10-更新打卡记录)
  - [删除打卡记录](#11-删除打卡记录)
- [统计模块](#统计模块)
  - [获取统计数据](#12-获取统计数据)
- [AI 助手模块](#ai-助手模块)
  - [AI 分析习惯](#13-ai-分析习惯)
  - [AI 智能体生成日程规划](#14-ai-智能体生成日程规划)

---

## 通用说明

### 响应格式

所有接口统一返回 JSON 格式:

**成功响应**:
```json
{
  "success": true,
  "data": { ... },
  "message": "可选的提示信息"
}
```

**失败响应**:
```json
{
  "success": false,
  "error": "错误说明"
}
```

### 状态码

| 状态码 | 含义 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或登录过期 |
| 404 | 资源不存在 |
| 409 | 资源冲突(如用户名已存在) |
| 500 | 服务器内部错误 |

### 认证机制

使用 JWT(JSON Web Token)进行身份认证,token 有效期为 **7 天**。

请求头格式:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 认证模块

### 1. 用户注册

**接口**: `POST /api/auth/register`

**说明**: 创建新用户账号,成功后自动登录并返回 token

**是否需要认证**: 否

**请求体参数**:

| 字段 | 类型 | 必填 | 限制 | 说明 |
|------|------|------|------|------|
| username | string | 是 | 2-30字符 | 用户名 |
| password | string | 是 | 至少6字符 | 密码 |

**请求示例**:
```json
{
  "username": "zhangsan",
  "password": "mypassword123"
}
```

**成功响应** (201):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "zhangsan",
      "avatar": ""
    }
  }
}
```

**失败响应**:
- 400: 用户名或密码为空
- 400: 用户名长度不符合要求
- 400: 密码长度不足6位
- 409: 用户名已存在
- 500: 注册失败

---

### 2. 用户登录

**接口**: `POST /api/auth/login`

**说明**: 通过用户名和密码登录,返回 token

**是否需要认证**: 否

**请求体参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**请求示例**:
```json
{
  "username": "zhangsan",
  "password": "mypassword123"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "zhangsan",
      "avatar": ""
    }
  }
}
```

**失败响应**:
- 400: 用户名或密码为空
- 401: 用户名或密码错误
- 500: 登录失败

---

### 3. 获取当前用户信息

**接口**: `GET /api/auth/me`

**说明**: 根据 token 获取当前登录用户的信息

**是否需要认证**: 是

**请求参数**: 无

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "zhangsan",
    "avatar": "",
    "createdAt": "2026-07-12T08:30:00.000Z"
  }
}
```

**失败响应**:
- 401: 未登录(token 缺失)
- 401: 登录已过期(token 无效或过期)
- 404: 用户不存在
- 500: 获取失败

---

## 习惯管理模块

### 4. 获取习惯列表

**接口**: `GET /api/habits`

**说明**: 获取当前用户的所有习惯(已根据今天的星期/过期日期过滤)

**是否需要认证**: 是

**请求参数**: 无

**成功响应** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "晨跑30分钟",
      "color": "#3B82F6",
      "icon": "🏃",
      "schedule": "每天",
      "timeRange": "06:00 - 08:00",
      "createdAt": "2026-07-10T08:00:00.000Z",
      "checkedToday": false
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "阅读",
      "color": "#10B981",
      "icon": "📚",
      "schedule": "周一、周三、周五",
      "timeRange": "20:00 - 22:00",
      "createdAt": "2026-07-11T08:00:00.000Z",
      "checkedToday": true
    }
  ]
}
```

**数据字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 习惯ID |
| name | string | 习惯名称 |
| color | string | 习惯颜色(十六进制) |
| icon | string | 习惯图标(emoji) |
| schedule | string | 重复计划(已格式化显示) |
| timeRange | string | 时间段 |
| createdAt | string | 创建时间(ISO 8601) |
| checkedToday | boolean | 今日是否已打卡 |

**失败响应**:
- 401: 未登录
- 500: 获取失败

---

### 5. 创建新习惯

**接口**: `POST /api/habits`

**说明**: 创建一个新的习惯

**是否需要认证**: 是

**请求体参数**:

| 字段 | 类型 | 必填 | 限制 | 说明 |
|------|------|------|------|------|
| name | string | 是 | 1-50字符 | 习惯名称 |
| color | string | 否 | 十六进制 | 习惯颜色,默认 `#3B82F6` |
| icon | string | 否 | emoji | 习惯图标,默认 `⭐` |
| schedule | number[] | 否 | - | 重复计划数组,见下方说明 |
| timeRange | string | 否 | - | 时间段,默认 `全天` |
| expireDate | string | 否 | YYYY-MM-DD | 过期日期(仅 schedule=[-1] 时使用) |

**schedule 字段说明**:
- `[]` (空数组): 每天
- `[-1]`: 仅一次(配合 `expireDate` 使用)
- `[0, 1, 3]`: 数组元素为 0-6,代表周日到周六

**请求示例**:
```json
{
  "name": "晨跑30分钟",
  "color": "#3B82F6",
  "icon": "🏃",
  "schedule": [],
  "timeRange": "06:00 - 08:00",
  "expireDate": ""
}
```

```json
{
  "name": "完成项目报告",
  "color": "#EF4444",
  "icon": "🎯",
  "schedule": [-1],
  "timeRange": "全天",
  "expireDate": "2026-07-20"
}
```

**成功响应** (201):
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "name": "晨跑30分钟",
    "color": "#3B82F6",
    "icon": "🏃",
    "createdAt": "2026-07-12T08:30:00.000Z"
  }
}
```

**失败响应**:
- 400: 习惯名称为空
- 400: 习惯名称超过50字符
- 401: 未登录
- 500: 创建失败

---

### 6. 更新习惯

**接口**: `PUT /api/habits`

**说明**: 更新已存在的习惯

**是否需要认证**: 是

**请求体参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 习惯ID |
| name | string | 否 | 新的习惯名称(1-50字符) |
| color | string | 否 | 新的颜色 |
| icon | string | 否 | 新的图标 |
| schedule | number[] | 否 | 新的重复计划 |
| timeRange | string | 否 | 新的时间段 |
| expireDate | string | 否 | 新的过期日期 |

**请求示例**:
```json
{
  "id": "507f1f77bcf86cd799439013",
  "name": "晨跑45分钟",
  "color": "#10B981",
  "icon": "🏃",
  "schedule": [1, 3, 5],
  "timeRange": "06:30 - 07:15",
  "expireDate": ""
}
```

**成功响应** (200):
```json
{
  "success": true,
  "message": "更新成功"
}
```

**失败响应**:
- 400: 缺少习惯ID
- 400: 习惯名称不合法
- 401: 未登录
- 404: 习惯不存在
- 500: 更新失败

---

### 7. 删除习惯

**接口**: `DELETE /api/habits?id=<habit_id>`

**说明**: 删除指定习惯及其所有打卡记录

**是否需要认证**: 是

**Query 参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 习惯ID |

**请求示例**:
```
DELETE /api/habits?id=507f1f77bcf86cd799439013
```

**成功响应** (200):
```json
{
  "success": true,
  "message": "删除成功"
}
```

**失败响应**:
- 400: 缺少习惯ID
- 401: 未登录
- 404: 习惯不存在
- 500: 删除失败

---

## 打卡模块

### 8. 习惯打卡

**接口**: `POST /api/habits/{id}/checkin`

**说明**: 对某个习惯进行打卡(再调用一次会取消打卡)

**是否需要认证**: 是

**路径参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 习惯ID |

**请求体参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| image | string | 否 | 打卡图片URL(先调用 `/api/upload` 上传) |
| note | string | 否 | 打卡备注 |

**请求示例**:
```json
{
  "image": "/uploads/checkins/1783829560165_userid.jpg",
  "note": "今天跑了5公里,感觉很好!"
}
```

**成功响应 - 打卡成功** (200):
```json
{
  "success": true,
  "checked": true,
  "data": {
    "id": "507f1f77bcf86cd799439020",
    "habitId": "507f1f77bcf86cd799439013",
    "date": "2026-07-12",
    "image": "/uploads/checkins/1783829560165_userid.jpg",
    "createdAt": "2026-07-12T08:30:00.000Z"
  },
  "message": "打卡成功"
}
```

**成功响应 - 取消打卡** (200):
```json
{
  "success": true,
  "checked": false,
  "message": "已取消今日打卡"
}
```

**失败响应**:
- 400: 缺少习惯ID
- 401: 未登录
- 404: 习惯不存在
- 500: 打卡失败

---

### 9. 获取打卡记录

**接口**: `GET /api/checkins?month=YYYY-MM`

**说明**: 获取指定月份的所有打卡记录(包含习惯信息)

**是否需要认证**: 是

**Query 参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| month | string | 否 | 月份,格式 `YYYY-MM`,默认当前月 |

**请求示例**:
```
GET /api/checkins?month=2026-07
```

**成功响应** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439020",
      "habitId": "507f1f77bcf86cd799439013",
      "habitName": "晨跑30分钟",
      "habitIcon": "🏃",
      "habitColor": "#3B82F6",
      "date": "2026-07-12",
      "image": "/uploads/checkins/1783829560165_userid.jpg",
      "note": "今天跑了5公里",
      "createdAt": "2026-07-12T08:30:00.000Z"
    }
  ]
}
```

**数据字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 打卡记录ID |
| habitId | string | 习惯ID |
| habitName | string | 习惯名称(已联表查询) |
| habitIcon | string | 习惯图标 |
| habitColor | string | 习惯颜色 |
| date | string | 打卡日期(YYYY-MM-DD) |
| image | string | 打卡图片URL(可为空) |
| note | string | 打卡备注(可为空) |
| createdAt | string | 创建时间(ISO 8601) |

**失败响应**:
- 401: 未登录
- 500: 获取失败

---

### 10. 更新打卡记录

**接口**: `PATCH /api/checkins`

**说明**: 更新打卡记录的图片和/或备注

**是否需要认证**: 是

**请求体参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 打卡记录ID |
| image | string | 否 | 新的图片URL |
| note | string | 否 | 新的备注 |

**请求示例**:
```json
{
  "id": "507f1f77bcf86cd799439020",
  "note": "更新后的备注",
  "image": "/uploads/checkins/new_image.jpg"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "message": "更新成功"
}
```

**失败响应**:
- 400: 缺少记录ID
- 401: 未登录
- 404: 记录不存在
- 500: 更新失败

---

### 11. 删除打卡记录

**接口**: `DELETE /api/checkins?id=<checkin_id>`

**说明**: 删除指定的打卡记录

**是否需要认证**: 是

**Query 参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 打卡记录ID |

**请求示例**:
```
DELETE /api/checkins?id=507f1f77bcf86cd799439020
```

**成功响应** (200):
```json
{
  "success": true,
  "message": "删除成功"
}
```

**失败响应**:
- 400: 缺少ID
- 401: 未登录
- 404: 记录不存在
- 500: 删除失败

---

## 统计模块

### 12. 获取统计数据

**接口**: `GET /api/stats`

**说明**: 获取用户的全部习惯和打卡数据(用于统计页面)

**是否需要认证**: 是

**请求参数**: 无

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "habits": [
      {
        "id": "507f1f77bcf86cd799439013",
        "name": "晨跑30分钟",
        "color": "#3B82F6",
        "icon": "🏃",
        "createdAt": "2026-07-10T08:00:00.000Z"
      }
    ],
    "checkins": [
      {
        "id": "507f1f77bcf86cd799439020",
        "habitId": "507f1f77bcf86cd799439013",
        "date": "2026-07-12",
        "image": "",
        "note": "",
        "createdAt": "2026-07-12T08:30:00.000Z"
      }
    ]
  }
}
```

**数据字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| habits | array | 习惯列表(包含完整信息) |
| checkins | array | 全部打卡记录(用于热力图、连续天数等计算) |

**失败响应**:
- 401: 未登录
- 500: 获取失败

---

## AI 助手模块

> **限流说明**: 所有 AI 接口每个用户每天最多调用次数不同(基于 `userId` 限流)

### 13. AI 分析习惯

**接口**: `POST /api/ai/analyze`

**说明**: 分析用户过去 7 天的习惯打卡数据,给出改进建议

**是否需要认证**: 是

**请求体参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| apiKey | string | 是 | OpenAI API Key |

**请求示例**:
```json
{
  "apiKey": "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": "近7天你的阅读习惯坚持最好(100%),但晨跑只完成了2天(28%)。建议:1. 固定晨跑时间,定闹钟提醒 2. 周末可增加运动量 3. 适当降低目标,从20分钟开始...",
  "remaining": 2
}
```

**响应字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| success | boolean | 是否成功 |
| data | string | AI 分析内容(≤300字) |
| remaining | number | 今日剩余调用次数 |

**失败响应**:
- 400: 缺少 API Key
- 401: 未登录
- 429: 今日免费额度已用完
- 500: AI 生成失败

---

### 14. AI 智能体生成日程规划

**接口**: `POST /api/ai/agent-plan`

**说明**: 根据用户描述的明日计划、目标日期、起床/睡觉时间,使用 DeepSeek AI 生成结构化的详细日程安排(包含总览和每个任务的具体安排)。与 `/api/ai/plan` 的区别:此接口接收用户的具体需求,并返回 JSON 格式的完整时间表;`/api/ai/plan` 仅基于用户现有习惯返回简单的文本建议。

**是否需要认证**: 是

**限流**: 10 次/天(其他 AI 接口是 3 次/天)

**请求体参数**:

| 字段 | 类型 | 必填 | 格式/限制 | 说明 |
|------|------|------|----------|------|
| apiKey | string | 是 | 以 `sk-` 开头 | DeepSeek API Key |
| userInput | string | 是 | 非空 | 用户描述想做的事情 |
| targetDate | string | 否 | YYYY-MM-DD | 目标日期,默认明天 |
| wakeTime | string | 否 | HH:MM | 起床时间,默认 `07:00` |
| sleepTime | string | 否 | HH:MM | 睡觉时间,默认 `23:00` |

**请求示例**:
```json
{
  "apiKey": "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "userInput": "明天上午要完成项目报告,下午3点健身,晚上陪家人吃饭,9点要读书1小时",
  "targetDate": "2026-07-13",
  "wakeTime": "07:00",
  "sleepTime": "23:00"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "date": "2026-07-13",
    "summary": "明天上午专注完成项目报告,下午安排健身保持活力,晚上陪伴家人并阅读充电,整体保持工作与生活平衡。",
    "tasks": [
      {
        "id": "1",
        "time": "07:00",
        "title": "起床洗漱",
        "duration": 30,
        "description": "起床、刷牙、洗脸、吃早餐",
        "category": "life",
        "priority": "medium"
      },
      {
        "id": "2",
        "time": "08:00",
        "title": "完成项目报告",
        "duration": 180,
        "description": "集中精力完成项目报告的核心章节,关闭社交媒体",
        "category": "work",
        "priority": "high"
      },
      {
        "id": "3",
        "time": "12:00",
        "title": "午餐+午休",
        "duration": 60,
        "description": "健康午餐,午休 30 分钟恢复精力",
        "category": "rest",
        "priority": "medium"
      },
      {
        "id": "4",
        "time": "15:00",
        "title": "健身锻炼",
        "duration": 90,
        "description": "力量训练 60 分钟 + 有氧 30 分钟",
        "category": "health",
        "priority": "high"
      },
      {
        "id": "5",
        "time": "18:00",
        "title": "陪伴家人晚餐",
        "duration": 90,
        "description": "与家人共进晚餐,聊聊今天的收获",
        "category": "social",
        "priority": "high"
      },
      {
        "id": "6",
        "time": "21:00",
        "title": "阅读充电",
        "duration": 60,
        "description": "阅读技术或人文书籍,做笔记",
        "category": "study",
        "priority": "medium"
      }
    ]
  },
  "remaining": 9
}
```

**响应字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| success | boolean | 是否成功 |
| data.date | string | 规划日期(YYYY-MM-DD) |
| data.summary | string | 整体规划思路说明(50-100字) |
| data.tasks | array | 任务列表,5-12 个任务 |
| data.tasks[].id | string | 任务 ID |
| data.tasks[].time | string | 开始时间(HH:MM,24小时制) |
| data.tasks[].title | string | 任务标题 |
| data.tasks[].duration | number | 持续时间(分钟) |
| data.tasks[].description | string | 具体说明 |
| data.tasks[].category | string | 任务分类,见下方枚举 |
| data.tasks[].priority | string | 优先级,见下方枚举 |
| remaining | number | 今日剩余调用次数(0-10) |

**任务分类(category)枚举**:

| 值 | 含义 | 图标 |
|------|------|------|
| work | 工作学习 | 💼 |
| health | 运动健康 | 🏃 |
| study | 学习成长 | 📚 |
| life | 日常生活 | 🏠 |
| social | 社交娱乐 | 🎉 |
| rest | 休息放松 | 😴 |

**优先级(priority)枚举**:

| 值 | 含义 |
|------|------|
| high | 高(重要且紧急) |
| medium | 中(重要但非紧急) |
| low | 低(可灵活调整) |

**失败响应**:
- 400: 缺少 API Key
- 400: 缺少或空的 userInput
- 401: 未登录或登录过期
- 429: 今日免费额度已用完(10次)
- 500: AI 生成失败(可能是网络/Key错误)
- 500: AI 返回数据格式异常(请重试)

---

## 数据模型

### User(用户)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| _id | ObjectId | 是 | 用户ID |
| username | string | 是 | 用户名(2-30字符,唯一) |
| password | string | 是 | bcrypt 加密后的密码 |
| avatar | string | 否 | 头像URL,默认为空 |
| createdAt | Date | 是 | 创建时间 |

### Habit(习惯)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| _id | ObjectId | 是 | 习惯ID |
| userId | string | 是 | 所属用户ID |
| name | string | 是 | 习惯名称(≤50字符) |
| color | string | 是 | 颜色(十六进制) |
| icon | string | 是 | 图标(emoji) |
| schedule | number[] | 是 | 重复计划 |
| timeRange | string | 是 | 时间段 |
| expireDate | string | 否 | 过期日期(仅一次时) |
| createdAt | Date | 是 | 创建时间 |

### Checkin(打卡记录)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| _id | ObjectId | 是 | 打卡记录ID |
| userId | string | 是 | 用户ID |
| habitId | string | 是 | 习惯ID |
| date | string | 是 | 打卡日期(YYYY-MM-DD) |
| image | string | 否 | 打卡图片URL |
| note | string | 否 | 打卡备注 |
| createdAt | Date | 是 | 创建时间 |

**复合唯一索引**: `(userId, habitId, date)` 唯一,保证每个习惯每天只能有一条打卡记录。

---

## 错误处理

### 常见错误码

| HTTP 状态码 | 含义 | 触发场景 |
|------------|------|----------|
| 400 | Bad Request | 参数缺失、格式错误、长度超限 |
| 401 | Unauthorized | token 缺失、无效或过期 |
| 404 | Not Found | 资源不存在(习惯、用户、记录) |
| 409 | Conflict | 资源冲突(用户名已存在) |
| 429 | Too Many Requests | AI 接口每日额度用尽 |
| 500 | Internal Server Error | 服务器内部错误 |

### 错误处理最佳实践

1. **所有响应都检查 `success` 字段**,而非 HTTP 状态码
2. **token 过期(401)时**,前端应自动跳转到登录页
3. **AI 接口额度用尽时**(remaining=0),提示用户明日再试

---

## 附录

### 环境变量

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| MONGODB_URI | 否 | mongodb://localhost:27017/habit_tracker | MongoDB 连接字符串 |
| JWT_SECRET | 否 | habit_tracker_secret_key_2026 | JWT 签名密钥,生产环境必须修改 |

### 调用示例

#### 完整注册-登录-打卡流程

```bash
# 1. 注册
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"zhangsan","password":"mypassword123"}'

# 2. 使用返回的 token 创建习惯
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -X POST http://localhost:3000/api/habits \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"晨跑","icon":"🏃","color":"#3B82F6","schedule":[],"timeRange":"全天"}'

# 3. 上传图片
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@photo.jpg"

# 4. 打卡
curl -X POST http://localhost:3000/api/habits/HABIT_ID/checkin \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"image":"/uploads/checkins/xxx.jpg","note":"今天完成了!"}'
```

### 在线文档

- **Swagger UI**: 启动服务后访问 `http://localhost:3000/doc`
- **OpenAPI JSON**: `http://localhost:3000/api/doc`

---

**文档版本**: v1.0.0
**最后更新**: 2026-07-12
