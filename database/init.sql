-- Habit Tracker 数据库初始化脚本

CREATE DATABASE IF NOT EXISTS habit_tracker
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE habit_tracker;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id         VARCHAR(64)  PRIMARY KEY,
  username   VARCHAR(30)  NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  avatar     VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 习惯表
CREATE TABLE IF NOT EXISTS habits (
  id         VARCHAR(64)  PRIMARY KEY,
  user_id    VARCHAR(64)  NOT NULL,
  name       VARCHAR(50)  NOT NULL,
  color      VARCHAR(7)   NOT NULL DEFAULT '#3B82F6',
  icon       VARCHAR(10)  NOT NULL DEFAULT '⭐',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_habit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 打卡记录表
CREATE TABLE IF NOT EXISTS checkins (
  id         VARCHAR(64)  PRIMARY KEY,
  habit_id   VARCHAR(64)  NOT NULL,
  user_id    VARCHAR(64)  NOT NULL,
  date       DATE         NOT NULL,
  image      VARCHAR(500) NOT NULL DEFAULT '',
  note       VARCHAR(200) NOT NULL DEFAULT '',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_habit_date (user_id, habit_id, date),
  CONSTRAINT fk_checkin_habit FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
  CONSTRAINT fk_checkin_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 上传文件目录
-- 打卡图片保存到 public/uploads/checkins/ 目录