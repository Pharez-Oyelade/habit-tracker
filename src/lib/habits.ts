import type { Habit } from "@/types/habit";

export function toggleHabitCompletion(habit: Habit, date: string): Habit {
  const alreadyCompleted = habit.completions.includes(date)
  const updatedCompletions = alreadyCompleted ? habit.completions.filter((d) => d !== date) : [...new Set([...habit.completions, date])];

  return {...habit, completions: updatedCompletions}
}