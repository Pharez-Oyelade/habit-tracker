"use client";

import { useState, useMemo } from "react";
import { useHabits } from "@/context/HabitContext";
import { useAuth } from "@/context/AuthContext";
import HabitCard from "./HabitCard";
import HabitForm from "./HabitForm";
import EmptyState from "../shared/EmptyState";

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 17) return "Good afternoon,";
  return "Good evening,";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default function HabitList() {
  const { habits } = useHabits();
  const { logout } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const today = useMemo(() => getTodayString(), []);

  const completedToday = habits.filter((h) =>
    h.completions.includes(today),
  ).length;

  const bestStreak = habits.reduce((best, h) => {
    const streak = h.completions.length;
    return streak > best ? streak : best;
  }, 0);

  function handleLogout() {
    logout();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-5 pt-8 pb-4">
        {/* Greeting */}
        <div className="flex justify-between items-center">
          <div>
            <p className="font-sans text-sm text-[var(--color-text-muted)]">
              {getGreeting()}
            </p>
            <h1 className="font-sans text-2xl font-bold text-[var(--color-text-primary)] mt-0.5">
              {formatDate(today)}
            </h1>
          </div>

          <button
            onClick={handleLogout}
            data-testid="auth-logout-button"
            className="bg-[var(--color-primary)] px-4 py-2 rounded-lg text-[var(--color-text-primary)] font-bold cursor-pointer hover:bg-[var(--color-primary-hover)] transition-all duration-500"
          >
            Logout
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "Habits", value: habits.length },
            { label: "Best Streak", value: `${bestStreak}d` },
            {
              label: "Done Today",
              value: `${completedToday}/${habits.length}`,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="
                flex flex-col items-center justify-center
                py-3 rounded-lg
                border border-[var(--color-border)]
                bg-[var(--color-card)]
              "
            >
              <span className="font-mono font-bold text-lg text-[var(--color-text-primary)]">
                {value}
              </span>
              <span className="label-mono mt-0.5">{label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* Section label */}
      <div className="flex items-center gap-3 px-5 mt-4 mb-3">
        <span className="label-mono whitespace-nowrap">Today's Habits</span>
        <div
          className="flex-1 h-px bg-[var(--color-border)]"
          aria-hidden="true"
        />
      </div>

      {/* Habit list or empty state */}
      <main className="flex-1 px-5 pb-32">
        {habits.length === 0 ? (
          <EmptyState onClick={() => setShowForm(true)} />
        ) : (
          // <div className="flex flex-col items-center justify-center">
          //   <span className="text-lg text-(--color-text-muted)">
          //     No habits yet. Click the button below to add one.
          //   </span>
          //   <button
          //     type="button"
          //     data-testid="create-habit-button"
          //     onClick={() => setShowForm(true)}
          //     aria-label="Create new habit"
          //     className="
          //       flex items-center justify-center
          //       w-14 h-14 rounded-full
          //       font-bold text-2xl text-white
          //       transition-all duration-[var(--duration-normal)]
          //       active:scale-90
          //       animate-pulse-glow
          //     "
          //     style={{
          //       backgroundColor: "var(--color-amber-500)",
          //       boxShadow: "var(--shadow-amber)",
          //     }}
          //   >
          //     <svg
          //       width="24"
          //       height="24"
          //       viewBox="0 0 24 24"
          //       fill="none"
          //       aria-hidden="true"
          //     >
          //       <path
          //         d="M12 5v14M5 12h14"
          //         stroke="white"
          //         strokeWidth="2.5"
          //         strokeLinecap="round"
          //       />
          //     </svg>
          //   </button>
          // </div>
          <ul
            className="flex flex-col gap-3 stagger-children"
            aria-label="Your habits"
          >
            {habits.map((habit) => (
              <li key={habit.id}>
                <HabitCard habit={habit} today={today} />
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Floating action button */}
      <button
        type="button"
        data-testid="create-habit-button"
        onClick={() => setShowForm(true)}
        aria-label="Create new habit"
        className="
    fixed bottom-8 right-6
    flex items-center justify-center
    w-14 h-14 rounded-full
    text-white
    transition-all duration-500
    active:scale-90
    animate-pulse
  "
        style={{
          backgroundColor: "#fbbf24",
          boxShadow: "0 0 10px #fbbf24",
          zIndex: 10,
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 5v14M5 12h14"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Create habit form  */}
      {showForm && <HabitForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
