import mongoose, { Schema, Document, Model } from "mongoose";

const MONGODB_URI: string = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "请在环境变量中设置 MONGODB_URI。\n" +
    "Vercel: Settings → Environment Variables → 添加 MONGODB_URI"
  );
}

// Global cache to avoid reconnecting on every request (serverless-friendly)
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = global as any;
if (!g.mongooseCache) {
  g.mongooseCache = { conn: null, promise: null };
}
const cached = g.mongooseCache as MongooseCache;

export async function connectDB() {
  if (cached.conn) {
    // 已有连接，检查状态
    if (mongoose.connection.readyState === 1) return;
    // 连接断开，重置缓存
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,          // serverless 必须关闭
      serverSelectionTimeoutMS: 5000, // 5秒超时
      connectTimeoutMS: 10000,        // 10秒连接超时
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    console.log("[DB] MongoDB 连接成功");
  } catch (e) {
    // 连接失败时重置缓存，允许下次请求重试
    cached.promise = null;
    cached.conn = null;
    console.error("[DB] MongoDB 连接失败:", e);
    throw e;
  }
}

// --- Schemas ---

export interface IUser extends Document {
  username: string;
  password: string;
  avatar: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true, minlength: 2, maxlength: 30 },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export interface IHabit extends Document {
  userId: string;
  name: string;
  color: string;
  icon: string;
  schedule: number[];
  timeRange: string;
  createdAt: Date;
  expireDate?: string;
}

const HabitSchema = new Schema<IHabit>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 50 },
  color: { type: String, default: "#3B82F6" },
  icon: { type: String, default: "⭐" },
  schedule: { type: [Number], default: [] },
  timeRange: { type: String, default: "全天" },
  expireDate: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export interface ICheckin extends Document {
  habitId: string;
  userId: string;
  date: string;
  image: string;
  note: string;
  createdAt: Date;
}

const CheckinSchema = new Schema<ICheckin>({
  habitId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true },
  image: { type: String, default: "" },
  note: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

// Compound unique index for checkins
CheckinSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

// --- Models ---
export const User = (mongoose.models.User || mongoose.model<IUser>("User", UserSchema)) as Model<IUser>;
export const Habit = (mongoose.models.Habit || mongoose.model<IHabit>("Habit", HabitSchema)) as Model<IHabit>;
export const Checkin = (mongoose.models.Checkin || mongoose.model<ICheckin>("Checkin", CheckinSchema)) as Model<ICheckin>;

// --- Helpers ---
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export function getTodayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
