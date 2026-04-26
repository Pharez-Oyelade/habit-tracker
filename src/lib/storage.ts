import { STORAGE_KEYS } from "./constants";
import type { User, Session } from "@/types/auth";
import type { Habit } from "@/types/habit";

// Users
export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];

  return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) ?? '[]');
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users))
}

// session
export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;

  return JSON.parse(localStorage.getItem(STORAGE_KEYS.session) ?? 'null');
}

export function saveSession(session: Session | null): void {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.setItem(STORAGE_KEYS.session, 'null')
}


// Habits
export function getHabits(): Habit[] {
  if (typeof window === 'undefined') return [];

  return JSON.parse(localStorage.getItem(STORAGE_KEYS.habits) ?? '[]');
}

export function saveHabits(habits: Habit[]): void {
  localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(habits))
}