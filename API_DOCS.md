# API 接口文档

## 通用说明

- **Base URL**: `/api`
- **数据格式**: JSON（除上传接口外）
- **鉴权**: 所有需要鉴权的接口需在 Header 中携带 `Authorization: Bearer <JWT_TOKEN>`，未携带返回 401。
- **频率限制**: AI 接口（`/api/ai/*`）每日每用户 3 次。

### 统一响应格式

成功响应：
```json
{
  "success": true,
  "data": { ... }
}
```

错误响应：
```json
{
  "success": false,
  "error": "错误描述"
}
```

---

## 1. 用户注册

**POST** `/api/auth/register`

### 请求参数 (JSON Body)
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `username` | string | 是 | 用户名，2-30 个字符 |
| `password` | string | 是 | 密码，至少 6 位 |

### 请求示例
```json
{
  "username": "testuser",
  "password": "123456"
}
```

### 成功响应 (201)
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "u1abc2def",
      "username": "testuser",
      "avatar": null
    }
  }
}
```

### 错误响应
| 状态码 | 场景 |
|--------|------|
| 400 | 参数校验失败（用户名长度不符、密码过短等） |
| 409 | 用户名已存在 |

```json
{
  "success": false,
  "error": "用户名已存在"
}
```

---

## 2. 用户登录

**POST** `/api/auth/login`

### 请求参数 (JSON Body)
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `username` | string | 是 | 用户名 |
| `password` | string | 是 | 密码 |

### 请求示例
```json
{
  "username": "testuser",
  "password": "123456"
}
```

### 成功响应 (200)
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "u1abc2def",
      "username": "testuser",
      "avatar": null
    }
  }
}
```

### 错误响应
| 状态码 | 场景 |
|--------|------|
| 401 | 用户名或密码错误 |

```json
{
  "success": false,
  "error": "用户名或密码错误"
}
```

---

## 3. 获取当前用户

**GET** `/api/auth/me`

### 请求头
| Header | 值 | 必填 |
|--------|-----|------|
| `Authorization` | `Bearer <token>` | 是 |

### 成功响应 (200)
```json
{
  "success": true,
  "data": {
    "id": "u1abc2def",
    "username": "testuser",
    "avatar": null,
    "created_at": "2026-07-11T08:00:00.000Z"
  }
}
```

---

## 4. 获取习惯列表

**GET** `/api/habits`

### 请求头
| Header | 值 | 必填 |
|--------|-----|------|
| `Authorization` | `Bearer <token>` | 是 |

### 请求参数
无

### 成功响应 (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "m1abc2def",
      "name": "晨跑30分钟",
      "color": "#3B82F6",
      "icon": "🏃",
      "createdAt": "2026-07-09T08:00:00.000Z",
      "checkedToday": true
    },
    {
      "id": "n3xyz4ghi",
      "name": "阅读1小时",
      "color": "#10B981",
      "icon": "📚",
      "createdAt": "2026-07-09T08:00:00.000Z",
      "checkedToday": false
    }
  ]
}
```

### 字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 习惯唯一标识 |
| `name` | string | 习惯名称 |
| `color` | string | 主题颜色（HEX） |
| `icon` | string | 显示图标（Emoji） |
| `createdAt` | string | 创建时间（ISO 8601） |
| `checkedToday` | boolean | 今日是否已打卡 |

---

## 5. 创建习惯

**POST** `/api/habits`

### 请求头
| Header | 值 | 必填 |
|--------|-----|------|
| `Authorization` | `Bearer <token>` | 是 |

### 请求参数 (JSON Body)
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 习惯名称，1-50 个字符 |
| `color` | string | 否 | 主题颜色 |
| `icon` | string | 否 | 图标 Emoji |

### 请求示例
```json
{
  "name": "冥想15分钟",
  "color": "#8B5CF6",
  "icon": "🧘"
}
```

### 成功响应 (201)
```json
{
  "success": true,
  "data": {
    "id": "o5pqr6stu",
    "name": "冥想15分钟",
    "color": "#8B5CF6",
    "icon": "🧘",
    "createdAt": "2026-07-11T10:30:00.000Z"
  }
}
```

---

## 6. 编辑习惯

**PUT** `/api/habits`

### 请求头
| Header | 值 | 必填 |
|--------|-----|------|
| `Authorization` | `Bearer <token>` | 是 |

### 请求参数 (JSON Body)
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 习惯 ID |
| `name` | string | 否 | 习惯名称 |
| `color` | string | 否 | 主题颜色 |
| `icon` | string | 否 | 图标 Emoji |

### 请求示例
```json
{
  "id": "o5pqr6stu",
  "name": "冥想20分钟",
  "color": "#A78BFA"
}
```

### 成功响应 (200)
```json
{
  "success": true,
  "message": "更新成功"
}
```

---

## 7. 删除习惯

**DELETE** `/api/habits?id=xxx`

### 请求头
| Header | 值 | 必填 |
|--------|-----|------|
| `Authorization` | `Bearer <token>` | 是 |

### 请求参数 (Query String)
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 习惯 ID |

### 成功响应 (200)
```json
{
  "success": true,
  "message": "删除成功"
}
```

---

## 8. 打卡 / 取消打卡

**POST** `/api/habits/:id/checkin`

### 请求头
| Header | 值 | 必填 |
|--------|-----|------|
| `Authorization` | `Bearer <token>` | 是 |

### 路径参数
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 习惯 ID |

### 请求参数 (JSON Body)
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image` | string | 否 | 打卡图片 URL |
| `note` | string | 否 | 文字备注 |

### 行为说明
- 如果**今天未打卡**：创建一条打卡记录，返回 `checked: true`
- 如果**今天已打卡**：删除今天的打卡记录，返回 `checked: false`

### 成功响应 - 打卡 (200)
```json
{
  "success": true,
  "checked": true,
  "message": "打卡成功"
}
```

### 成功响应 - 取消打卡 (200)
```json
{
  "success": true,
  "checked": false,
  "message": "已取消今日打卡"
}
```

---

## 9. 获取历史打卡记录

**GET** `/api/checkins?month=2026-07`

### 请求头
| Header | 值 | 必填 |
|--------|-----|------|
| `Authorization` | `Bearer <token>` | 是 |

### 请求参数 (Query String)
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `month` | string | 是 | 月份，格式 `YYYY-MM` |

### 成功响应 (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "c7vwx8yz",
      "habitId": "m1abc2def",
      "habitName": "晨跑30分钟",
      "habitIcon": "🏃",
      "habitColor": "#3B82F6",
      "date": "2026-07-11",
      "image": "/uploads/checkins/abc123.jpg",
      "note": "今天跑了5公里",
      "createdAt": "2026-07-11T07:30:00.000Z"
    }
  ]
}
```

### 字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 打卡记录唯一标识 |
| `habitId` | string | 关联的习惯 ID |
| `habitName` | string | 习惯名称 |
| `habitIcon` | string | 习惯图标 |
| `habitColor` | string | 习惯颜色 |
| `date` | string | 打卡日期 |
| `image` | string | 打卡图片 URL（可为 null） |
| `note` | string | 文字备注（可为 null） |
| `createdAt` | string | 创建时间（ISO 8601） |

---

## 10. 删除打卡记录

**DELETE** `/api/checkins?id=xxx`

### 请求头
| Header | 值 | 必填 |
|--------|-----|------|
| `Authorization` | `Bearer <token>` | 是 |

### 请求参数 (Query String)
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 打卡记录 ID |

### 成功响应 (200)
```json
{
  "success": true,
  "message": "删除成功"
}
```

---

## 11. 获取统计数据

**GET** `/api/stats`

### 请求头
| Header | 值 | 必填 |
|--------|-----|------|
| `Authorization` | `Bearer <token>` | 是 |

### 请求参数
无

### 成功响应 (200)
```json
{
  "success": true,
  "data": {
    "habits": [
      {
        "id": "m1abc2def",
        "name": "晨跑30分钟",
        "color": "#3B82F6",
        "icon": "🏃",
        "createdAt": "2026-07-09T08:00:00.000Z"
      }
    ],
    "checkins": [
      {
        "id": "c7vwx8yz",
        "habitId": "m1abc2def",
        "date": "2026-07-11",
        "createdAt": "2026-07-11T07:30:00.000Z"
      }
    ]
  }
}
```

---

## 12. 上传图片

**POST** `/api/upload`

### 请求头
| Header | 值 | 必填 |
|--------|-----|------|
| `Authorization` | `Bearer <token>` | 是 |
| `Content-Type` | `multipart/form-data` | 是 |

### 请求参数 (FormData)
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image` | File | 是 | 图片文件，支持 JPG/PNG/GIF/WebP，最大 5MB |

### 成功响应 (200)
```json
{
  "success": true,
  "data": {
    "url": "/uploads/checkins/abc123.jpg"
  }
}
```

---

## 13. AI 今日规划

**POST** `/api/ai/plan`

### 请求头
| Header | 值 | 必填 |
|--------|-----|------|
| `Authorization` | `Bearer <token>` | 是 |

### 请求参数 (JSON Body)
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `apiKey` | string | 是 | 用户提供的 OpenAI API Key |

### 成功响应 (200)
```json
{
  "success": true,
  "data": "根据你的习惯数据，今天建议你按照以下顺序进行：1. 晨跑30分钟（7:00）...",
  "remaining": 2
}
```

### 频率限制
每用户每日 3 次，超出返回 429。

---

## 14. AI 习惯分析

**POST** `/api/ai/analyze`

### 请求头
| Header | 值 | 必填 |
|--------|-----|------|
| `Authorization` | `Bearer <token>` | 是 |

### 请求参数 (JSON Body)
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `apiKey` | string | 是 | 用户提供的 OpenAI API Key |

### 成功响应 (200)
```json
{
  "success": true,
  "data": "你的习惯坚持情况分析如下：...",
  "remaining": 1
}
```

### 频率限制
每用户每日 3 次，超出返回 429。

---

## 15. AI 激励语

**POST** `/api/ai/motivate`

### 请求头
| Header | 值 | 必填 |
|--------|-----|------|
| `Authorization` | `Bearer <token>` | 是 |

### 请求参数 (JSON Body)
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `apiKey` | string | 是 | 用户提供的 OpenAI API Key |

### 成功响应 (200)
```json
{
  "success": true,
  "data": "你已经坚持晨跑第15天了，继续保持，每一次进步都值得骄傲！",
  "remaining": 0
}
```

### 频率限制
每用户每日 3 次，超出返回 429。