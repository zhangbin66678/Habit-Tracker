export interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Checkin {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface HabitData {
  habits: Habit[];
  checkins: Checkin[];
}