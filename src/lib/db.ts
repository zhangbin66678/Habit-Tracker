import mongoose, { Schema, Document, Model } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/habit_tracker";

// Global connection cache for serverless
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
  if (cached.conn) return;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }
  cached.conn = await cached.promise;
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
  schedule: number[]; // [0,1,2,3,4,5,6] = 日一二三四五六, [] = 每天
  createdAt: Date;
}

const HabitSchema = new Schema<IHabit>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 50 },
  color: { type: String, default: "#3B82F6" },
  icon: { type: String, default: "⭐" },
  schedule: { type: [Number], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export interface ICheckin extends Document {
  habitId: string;
  userId: string;
  date: string; // "YYYY-MM-DD"
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