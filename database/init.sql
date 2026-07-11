-- Habit Tracker 数据库初始化脚本

CREATE DATABASE IF NOT EXISTS habit_tracker
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE habit_tracker;

-- 习惯表
CREATE TABLE IF NOT EXISTS habits (
  id         VARCHAR(64)  PRIMARY KEY,
  name       VARCHAR(50)  NOT NULL,
  color      VARCHAR(7)   NOT NULL DEFAULT '#3B82F6',
  icon       VARCHAR(10)  NOT NULL DEFAULT '⭐',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 打卡记录表
CREATE TABLE IF NOT EXISTS checkins (
  id         VARCHAR(64)  PRIMARY KEY,
  habit_id   VARCHAR(64)  NOT NULL,
  date       DATE         NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_habit_date (habit_id, date),
  CONSTRAINT fk_checkin_habit FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 初始示例数据
INSERT IGNORE INTO habits (id, name, color, icon, created_at) VALUES
  ('1', '晨跑30分钟', '#3B82F6', '🏃', '2026-07-09 08:00:00'),
  ('2', '阅读1小时',   '#10B981', '📚', '2026-07-09 08:00:00'),
  ('3', '冥想15分钟',  '#8B5CF6', '🧘', '2026-07-09 08:00:00');

INSERT IGNORE INTO checkins (id, habit_id, date, created_at) VALUES
  ('c1', '1', '2026-07-09', '2026-07-09 07:30:00'),
  ('c2', '2', '2026-07-09', '2026-07-09 21:00:00'),
  ('c3', '3', '2026-07-09', '2026-07-09 22:00:00'),
  ('c4', '1', '2026-07-10', '2026-07-10 07:00:00'),
  ('c5', '2', '2026-07-10', '2026-07-10 20:30:00'),
  ('c6', '1', '2026-07-11', '2026-07-11 06:45:00');