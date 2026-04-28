"use client";

import { useState } from "react";
import type { Habit } from "@/types/habit";
import { useHabits } from "@/context/HabitContext";
import { getHabitSlug } from "@/lib/slug";
import { calculateCurrentStreak } from "@/lib/streaks";
import HabitForm from "./HabitForm";

interface HabitCardProps {
  habit: Habit;
  today: string;
}

interface ArcRingProps {
  streak: number;
  isCompleted: boolean;
}

function ArcRing({ streak, isCompleted }: ArcRingProps) {
  const size = 48;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const fillRatio = Math.min(streak / 7, 1);
  const dashOffset = circumference * (1 - fillRatio);

  const trackColor = "var(--color-border)";
  const activeColor = isCompleted
    ? "var(--color-success-500)"
    : streak > 0
      ? "var(--color-amber-500)"
      : "var(--color-border)";

  const glowColor = isCompleted
    ? "var(--color-glow-success)"
    : "var(--color-glow-amber)";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        {streak > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={activeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              filter: streak > 0 ? `drop-shadow(0 0 4px ${glowColor})` : "none",
              transition: "stroke-dashoffset 0.5s var(--ease-smooth)",
            }}
          />
        )}
      </svg>

      {/* Streak number in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-md font-bold"
          style={{
            fontSize: streak >= 100 ? "10px" : streak >= 10 ? "13px" : "16px",
            color:
              streak > 0
                ? isCompleted
                  ? "var(--color-success)"
                  : "var(--color-amber)"
                : "var(--color-text-muted)",
          }}
        >
          {streak}
        </span>
      </div>
    </div>
  );
}

export default function HabitCard({ habit, today }: HabitCardProps) {
  const { deleteHabit, toggleCompletion } = useHabits();

  const [showEdit, setShowEdit] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const slug = getHabitSlug(habit.name);
  const streak = calculateCurrentStreak(habit.completions, today);
  const isCompleted = habit.completions.includes(today);

  function handleDelete() {
    deleteHabit(habit.id);
    setShowConfirm(false);
  }

  return (
    <>
      <article
        data-testid={`habit-card-${slug}`}
        className="
          relative overflow-hidden
          rounded-2xl
          border border-(--color-border)
          shadow-md"
        style={{
          backgroundColor: isCompleted
            ? "var(--color-success-muted)"
            : "var(--color-card)",
          borderColor: isCompleted
            ? "var(--color-success)"
            : "var(--color-border)",
        }}
      >
        {/* Left edge streak indicator strip */}
        <div
          aria-hidden="true"
          className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-full ${isCompleted ? "bg-green-500 shadow-[0_0_8px_(var(--color-glow-success))]" : streak > 0 ? "bg-amber-500 shadow-[0_0_8px_(var(--color-glow-amber))]" : "bg-border"} transition-all duration-300 ease-in-out`}
        />

        {/* Card body */}
        <div className="pl-5 pr-4 pt-4 pb-3">
          {/* Top row — arc ring + content + complete button */}
          <div className="flex items-center gap-3">
            {/* Arc ring */}
            <div
              data-testid={`habit-streak-${slug}`}
              aria-label={`${streak} day streak`}
            >
              <ArcRing streak={streak} isCompleted={isCompleted} />
            </div>

            {/* Habit info */}
            <div className="flex-1 min-w-0">
              <p
                className="
                  font-sans font-semibold text-base leading-snug truncate
                  transition-colors duration-300 ease-out
                "
                style={{
                  color: isCompleted
                    ? "var(--color-text-muted)"
                    : "var(--color-text-primary)",
                  textDecorationLine: isCompleted ? "line-through" : "none",
                  textDecorationColor: "var(--color-text-muted)",
                }}
              >
                {habit.name}
              </p>

              {habit.description && (
                <p className="mt-0.5 text-xs text-(--color-text-muted) truncate">
                  {habit.description}
                </p>
              )}

              <p className="mt-1 font-mono text-[10px] text-(--color-text-disabled) uppercase tracking-wider">
                Daily
                {streak > 0 && !isCompleted && (
                  <span className="ml-2 text-amber-500">
                    🔥 {streak} day streak
                  </span>
                )}
                {isCompleted && (
                  <span className="ml-2 text-(--color-success)">
                    ✓ Done today
                  </span>
                )}
              </p>
            </div>

            {/* Completion toggle button */}
            <button
              type="button"
              data-testid={`habit-complete-${slug}`}
              onClick={() => toggleCompletion(habit.id)}
              aria-label={
                isCompleted
                  ? `Mark ${habit.name} incomplete`
                  : `Mark ${habit.name} complete`
              }
              aria-pressed={isCompleted}
              className="
                shrink-0
                flex items-center justify-center
                w-9 h-9 rounded-full
                border-2
                transition-all duration-300 ease-out
                active:scale-90
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-offset-2
                focus-visible:ring-offset-(--color-card)
                cursor-pointer
              "
              style={
                {
                  borderColor: isCompleted
                    ? "var(--color-success)"
                    : "var(--color-border)",
                  backgroundColor: isCompleted
                    ? "var(--color-success)"
                    : "transparent",
                  boxShadow: isCompleted ? "var(--shadow-success)" : "none",
                  // focus ring
                  "--tw-ring-color": isCompleted
                    ? "var(--color-glow-success)"
                    : "var(--color-glow-indigo)",
                } as React.CSSProperties
              }
            >
              {isCompleted ? (
                // Solid checkmark
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8l3.5 3.5L13 5"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                // Empty checkmark outline
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2.5 7l3 3L11.5 4"
                    stroke="var(--color-text-muted)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Bottom row — edit & delete actions */}
          <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-(--color-border)">
            {/* Edit */}
            <button
              type="button"
              data-testid={`habit-edit-${slug}`}
              onClick={() => setShowEdit(true)}
              aria-label={`Edit ${habit.name}`}
              className="
                flex items-center gap-1.5
                px-3 py-1.5 rounded-md
                text-xs font-mono text-(--color-text-muted)
                uppercase tracking-wider
                hover:text-(--color-text-primary)
                hover:bg-(--color-secondary)
                transition-all duration-300 ease-out
                cursor-pointer
              "
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Edit
            </button>

            {/* Delete */}
            <button
              type="button"
              data-testid={`habit-delete-${slug}`}
              onClick={() => setShowConfirm(true)}
              aria-label={`Delete ${habit.name}`}
              className="
                flex items-center gap-1.5
                px-3 py-1.5 rounded-md
                text-xs font-mono text-(--color-text-muted)
                uppercase tracking-wider
                hover:text-red-500
                hover:bg-red-500/10
                transition-all duration-300 ease-out
                cursor-pointer
              "
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 3h8M5 3V2h2v1M4.5 5v4M7.5 5v4M3 3l.5 7h5l.5-7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </article>

      {/* ── Delete confirmation dialog ─────────────────────────────────────── */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-999 flex items-center justify-center px-6"
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        >
          <div
            className="
              w-full max-w-[320px]
              bg-(--color-card)
              border border-(--color-border)
              rounded-2xl
              p-6
              animate-fade-in-up
            "
          >
            {/* Warning icon */}
            <div className="flex justify-center mb-4">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-full"
                style={{
                  backgroundColor: "rgba(255,107,43,0.1)",
                  border: "1px solid var(--color-amber-500)",
                }}
              >
                <span className="text-xl" aria-hidden="true">
                  !
                </span>
              </div>
            </div>

            <h3 className="text-center font-sans font-bold text-lg text-(--color-text-primary) mb-2">
              Delete Habit
            </h3>

            <p className="text-center text-sm text-(--color-text-muted) mb-6 leading-relaxed">
              This will permanently delete{" "}
              <span className="text-(--color-text-primary) font-semibold">
                "{habit.name}"
              </span>{" "}
              and all its streak data. This cannot be undone.
            </p>

            <div className="flex flex-col gap-3">
              {/* Confirm delete */}
              <button
                type="button"
                data-testid="confirm-delete-button"
                onClick={handleDelete}
                className="
                  w-full h-12
                  rounded-lg
                  font-sans font-bold text-base text-white
                  transition-all duration-300
                  active:scale-[0.98]
                  bg-red-500
                  hover:bg-red-600
                  cursor-pointer
                "
              >
                Yes, delete it
              </button>

              {/* Cancel */}
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="
                  w-full h-12
                  rounded-lg
                  border border-(--color-border)
                  bg-transparent
                  font-sans font-medium text-base text-(--color-text-primary)
                  hover:bg-(--color-secondary)
                  transition-all duration-300
                  cursor-pointer
                "
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit form ─────────────────────────────────────────────────────── */}
      {showEdit && (
        <div className="z-999">
          <HabitForm initialHabit={habit} onClose={() => setShowEdit(false)} />
        </div>
      )}
    </>
  );
}
