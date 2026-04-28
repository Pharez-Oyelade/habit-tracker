"use client";

import { useState, useEffect } from "react";
import type { Habit } from "@/types/habit";
import { useHabits } from "@/context/HabitContext";
import { validateHabitName } from "@/lib/validators";

interface HabitFormProps {
  initialHabit?: Habit;
  onClose: () => void;
}

export default function HabitForm({ initialHabit, onClose }: HabitFormProps) {
  const { createHabit, updateHabit } = useHabits();
  const isEditing = Boolean(initialHabit);

  const [name, setName] = useState(initialHabit?.name ?? "");
  const [description, setDescription] = useState(
    initialHabit?.description ?? "",
  );
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    setName(initialHabit?.name ?? "");
    setDescription(initialHabit?.description ?? "");
    setNameError(null);
  }, [initialHabit]);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
    if (nameError) setNameError(null);
  }

  function handleSubmit() {
    const validation = validateHabitName(name);

    if (!validation.valid) {
      setNameError(validation.error);
      return;
    }

    if (isEditing && initialHabit) {
      updateHabit(initialHabit.id, {
        name: validation.value,
        description: description.trim(),
      });
    } else {
      createHabit({
        name: validation.value,
        description: description.trim(),
      });
    }

    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Bottom sheet */}
      <div
        data-testid="habit-form"
        className="
          w-full
          bg-(--color-card)/60
          border border-(--color-border)
          rounded-t-2xl
          px-6 pt-3 pb-10
          animate-slide-up
        "
      >
        {/* Drag handle */}
        <div className="mx-auto mb-5 h-1 w-9 rounded-full bg-(--color-border)" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-sans text-xl font-bold text-(--color-text-primary)">
            {isEditing ? "Edit Habit" : "New Habit"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="
              flex items-center justify-center
              w-8 h-8 rounded-full
              text-(--color-text-muted)
              hover:text-(--color-text-primary)
              cursor-pointer
              transition-colors duration-500
            "
            aria-label="Close form"
          >
            ✕
          </button>
        </div>

        {/* Form fields */}
        <div className="flex flex-col gap-5">
          {/* Habit name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="habit-name"
              className="font-sans text-sm text-(--color-text-primary)"
            >
              Habit Name
            </label>
            <input
              id="habit-name"
              type="text"
              data-testid="habit-name-input"
              value={name}
              onChange={handleNameChange}
              maxLength={65}
              placeholder="e.g. Morning Run"
              autoComplete="off"
              className="
                w-full h-[52px] px-4
                bg-(--color-card)/50
                border border-(--color-border)
                rounded-lg
                font-sans text-base text-(--color-text-primary)
                placeholder:text-(--color-text-muted)
                transition-colors duration-300
                outline-none
                focus:border-indigo-500
                focus:shadow-[0_0_0_3px_var(--color-glow-indigo)]
                aria-[invalid=true]:border-red-500
              "
              style={{
                borderColor: nameError ? "red" : "var(--color-border)",
              }}
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? "name-error" : undefined}
            />

            {/* Character count + error row */}
            <div className="flex items-center justify-between px-1">
              {nameError ? (
                <p
                  id="name-error"
                  role="alert"
                  className="text-xs text-red-500"
                >
                  {nameError}
                </p>
              ) : (
                <span />
              )}
              <span
                className="text-xs text-(--color-text-muted) ml-auto"
                aria-live="polite"
              >
                {name.length}/60
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="habit-description"
              className="font-sans text-sm text-(--color-text-primary)"
            >
              Description
              <span className="ml-2 normal-case tracking-normal text-(--color-text-disabled) font-normal">
                optional
              </span>
            </label>
            <textarea
              id="habit-description"
              data-testid="habit-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional note about this habit..."
              rows={3}
              className="
                w-full px-4 py-3
                bg-(--color-card)/50
                border border-(--color-border)
                rounded-lg
                font-sans text-base text-(--color-text-primary)
                placeholder:text-(--color-text-muted)
                resize-none
                transition-colors duration-300
                outline-none
                focus:border-indigo-500
                focus:shadow-[0_0_0_3px_var(--color-glow-indigo)]
              "
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="habit-frequency"
              className="font-sans text-sm text-(--color-text-primary)"
            >
              Frequency
            </label>
            <select
              id="habit-frequency"
              data-testid="habit-frequency-select"
              defaultValue="daily"
              disabled
              className="
                w-full h-[52px] px-4
                bg-(--color-card)/50
                border border-(--color-border)
                rounded-lg
                font-sans text-base
                text-indigo-400
                appearance-none
                cursor-not-allowed
                opacity-80
                outline-none
              "
            >
              <option value="daily">Daily</option>
            </select>
          </div>
        </div>

        {/* Save button */}
        <button
          type="button"
          data-testid="habit-save-button"
          onClick={handleSubmit}
          className="
            mt-8 w-full h-[52px]
            rounded-lg
            bg-indigo-500
            hover:bg-indigo-400
            active:scale-[0.98]
            font-sans text-base font-bold text-white
            transition-all duration-300
            outline-none focus-visible:shadow-[0_0_0_3px_var(--color-glow-indigo)]
          "
        >
          {isEditing ? "Save Changes" : "Save Habit"}
        </button>
      </div>
    </div>
  );
}
