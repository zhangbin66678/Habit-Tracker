# API 接口文档

## 基础信息

- **Base URL**: `/api`
- **数据格式**: JSON
- **统一响应格式**:

```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
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

## 1. 获取习惯列表

**GET** `/api/habits`

### 请求参数
无

### 响应示例
```json
{
  "success": true,
  "data": [
    {
      "id": "m1abc2def",
      "name": "晨跑30分钟",
      "color": "#3B82F6",
      "icon": "🏃",
      "checkedToday": true,
      "createdAt": "2026-07-09T08:00:00.000Z"
    },
    {
      "id": "n3xyz4ghi",
      "name": "阅读1小时",
      "color": "#10B981",
      "icon": "📚",
      "checkedToday": false,
      "createdAt": "2026-07-09T08:00:00.000Z"
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
| `checkedToday` | boolean | 今日是否已打卡 |
| `createdAt` | string | 创建时间（ISO 8601） |

---

## 2. 创建新习惯

**POST** `/api/habits`

### 请求参数 (JSON Body)
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 习惯名称，1-50个字符 |
| `color` | string | 否 | 主题颜色，默认 `#3B82F6` |
| `icon` | string | 否 | 图标Emoji，默认 `⭐` |

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

### 错误响应
| 状态码 | 场景 |
|--------|------|
| 400 | 名称为空 / 超过50字符 |
| 500 | 服务器内部错误 |

---

## 3. 打卡 / 取消打卡（Toggle）

**POST** `/api/habits/:id/checkin`

### 路径参数
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 习惯ID |

### 请求参数
无（Body为空）

### 行为说明
- 如果**今天未打卡**：创建一条打卡记录，返回 `checked: true`
- 如果**今天已打卡**：删除今天的打卡记录，返回 `checked: false`

### 成功响应 - 打卡
```json
{
  "success": true,
  "checked": true,
  "data": {
    "id": "c7vwx8yz",
    "habitId": "m1abc2def",
    "date": "2026-07-11",
    "createdAt": "2026-07-11T07:30:00.000Z"
  },
  "message": "打卡成功"
}
```

### 成功响应 - 取消打卡
```json
{
  "success": true,
  "checked": false,
  "message": "已取消今日打卡"
}
```

### 错误响应
| 状态码 | 场景 |
|--------|------|
| 400 | 缺少习惯ID |
| 404 | 习惯不存在 |
| 500 | 服务器内部错误 |

---

## 附加接口：获取统计数据

**GET** `/api/stats`

返回所有习惯和打卡记录的原始数据，用于前端统计页面渲染。

### 响应示例
```json
{
  "success": true,
  "data": {
    "habits": [ ... ],
    "checkins": [ ... ]
  }
}
```