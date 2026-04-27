"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "./AuthContext";
import { getHabits, saveHabits } from "@/lib/storage";
import { toggleHabitCompletion } from "@/lib/habits";
import type { Habit } from "@/types/habit";

interface CreateHabitInput {
  name: string;
  description: string;
}

interface UpdateHabitInput {
  name: string;
  description: string;
}

interface HabitsContextState {
  habits: Habit[];
  createHabit: (input: CreateHabitInput) => void;
  updateHabit: (id: string, input: UpdateHabitInput) => void;
  deleteHabit: (id: string) => void;
  toggleCompletion: (id: string) => void;
}

const HabitContext = createContext<HabitsContextState | null>(null);

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function HabitsProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);

  // load and filter for current user
  useEffect(() => {
    if (!session) {
      setHabits([]);
      return;
    }

    const allHabits = getHabits();
    const userHabits = allHabits.filter(
      (habit) => habit.userId === session.userId,
    );
    setHabits(userHabits);
  }, [session]);

  const persistHabits = useCallback(
    (updatedUserHabits: Habit[]) => {
      if (!session) return;

      const allHabits = getHabits();

      const otherUsersHabits = allHabits.filter(
        (habit) => habit.userId !== session.userId,
      );
      const merged = [...otherUsersHabits, ...updatedUserHabits];
      saveHabits(merged);
      setHabits(updatedUserHabits);
    },
    [session],
  );

  // create
  const createHabit = useCallback(
    ({ name, description }: CreateHabitInput) => {
      if (!session) return;

      const newHabit: Habit = {
        id: uuidv4(),
        userId: session.userId,
        name: name.trim(),
        description: description.trim(),
        frequency: "daily",
        createdAt: new Date().toISOString(),
        completions: [],
      };

      persistHabits([...habits, newHabit]);
    },
    [session, habits, persistHabits],
  );

  // update
  const updateHabit = useCallback(
    (id: string, { name, description }: UpdateHabitInput) => {
      const updated = habits.map((h) => {
        if (h.id !== id) return h;

        return {
          ...h,
          name: name.trim(),
          description: description.trim(),
        };
      });

      persistHabits(updated);
    },
    [habits, persistHabits],
  );

  // delete
  const deleteHabit = useCallback(
    (id: string) => {
      const filtered = habits.filter((h) => h.id !== id);
      persistHabits(filtered);
    },
    [habits, persistHabits],
  );

  // toggle
  const toggleCompletion = useCallback(
    (id: string) => {
      const todayString = getTodayString();

      const toggled = habits.map((h) => {
        if (h.id !== id) return h;

        return toggleHabitCompletion(h, todayString);
      });

      persistHabits(toggled);
    },
    [habits, persistHabits],
  );

  return (
    <HabitContext.Provider
      value={{
        habits,
        createHabit,
        updateHabit,
        deleteHabit,
        toggleCompletion,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

// hook
export function useHabits(): HabitsContextState {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error("useHabits must be used within HabitsProvider");
  return ctx;
}
