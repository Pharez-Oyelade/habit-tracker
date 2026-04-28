import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "@/context/AuthContext";
import { HabitsProvider } from "@/context/HabitContext";
import HabitList from "@/app/components/habits/HabitList";
import type { Habit } from "@/types/habit";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const TEST_USER_ID = "test-user-001";
const TEST_EMAIL = "habit@example.com";

function seedSession() {
  localStorage.setItem(
    "habit-tracker-session",
    JSON.stringify({ userId: TEST_USER_ID, email: TEST_EMAIL }),
  );
  localStorage.setItem(
    "habit-tracker-users",
    JSON.stringify([
      {
        id: TEST_USER_ID,
        email: TEST_EMAIL,
        password: "password123",
        createdAt: new Date().toISOString(),
      },
    ]),
  );
}

function seedHabit(
  name: string,
  completions: string[] = [],
  id = "habit-seed-001",
): Habit {
  const habit: Habit = {
    id,
    userId: TEST_USER_ID,
    name,
    description: "",
    frequency: "daily",
    createdAt: "2025-01-01T00:00:00.000Z",
    completions,
  };
  localStorage.setItem("habit-tracker-habits", JSON.stringify([habit]));
  return habit;
}

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

// Wraps HabitList in both required providers
function renderHabitList() {
  return render(
    <AuthProvider>
      <HabitsProvider>
        <HabitList />
      </HabitsProvider>
    </AuthProvider>,
  );
}

describe("habit form", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // Validation

  it("shows a validation error when habit name is empty", async () => {
    seedSession();
    const user = userEvent.setup();
    renderHabitList();

    // Wait for the dashboard to fully mount after AuthContext reads storage
    await waitFor(() => {
      expect(screen.getByTestId("create-habit-button")).toBeInTheDocument();
    });

    // Open form
    await user.click(screen.getByTestId("create-habit-button"));

    await waitFor(() => {
      expect(screen.getByTestId("habit-form")).toBeInTheDocument();
    });

    // Submit without entering anything
    await user.click(screen.getByTestId("habit-save-button"));

    // Spec-mandated validation message
    expect(screen.getByText("Habit name is required")).toBeInTheDocument();

    // Form must remain open — nothing was saved
    expect(screen.getByTestId("habit-form")).toBeInTheDocument();
  });

  // Create

  it("creates a new habit and renders it in the list", async () => {
    seedSession();
    const user = userEvent.setup();
    renderHabitList();

    await waitFor(() => {
      expect(screen.getByTestId("create-habit-button")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("create-habit-button"));

    await waitFor(() => {
      expect(screen.getByTestId("habit-form")).toBeInTheDocument();
    });

    await user.type(screen.getByTestId("habit-name-input"), "Drink Water");
    await user.type(
      screen.getByTestId("habit-description-input"),
      "8 glasses a day",
    );
    await user.click(screen.getByTestId("habit-save-button"));

    // Form must close after saving
    await waitFor(() => {
      expect(screen.queryByTestId("habit-form")).not.toBeInTheDocument();
    });

    // Slug-based card must appear in the list
    await waitFor(() => {
      expect(screen.getByTestId("habit-card-drink-water")).toBeInTheDocument();
    });

    // Habit must be persisted to localStorage
    const habits = JSON.parse(
      localStorage.getItem("habit-tracker-habits") ?? "[]",
    );
    expect(habits).toHaveLength(1);
    expect(habits[0].name).toBe("Drink Water");
    expect(habits[0].userId).toBe(TEST_USER_ID);
    expect(habits[0].frequency).toBe("daily");
    expect(habits[0].completions).toEqual([]);
  });

  //  Edit

  it("edits an existing habit and preserves immutable fields", async () => {
    seedSession();
    const original = seedHabit("Morning Run");
    const user = userEvent.setup();
    renderHabitList();

    await waitFor(() => {
      expect(screen.getByTestId("habit-card-morning-run")).toBeInTheDocument();
    });

    // Open the edit form for this habit
    await user.click(screen.getByTestId("habit-edit-morning-run"));

    await waitFor(() => {
      expect(screen.getByTestId("habit-form")).toBeInTheDocument();
    });

    // Name input should be pre-filled with current name
    expect(screen.getByTestId("habit-name-input")).toHaveValue("Morning Run");

    // Change the name
    const nameInput = screen.getByTestId("habit-name-input");
    await user.clear(nameInput);
    await user.type(nameInput, "Evening Run");
    await user.click(screen.getByTestId("habit-save-button"));

    // Old slug gone, new slug present
    await waitFor(() => {
      expect(
        screen.queryByTestId("habit-card-morning-run"),
      ).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByTestId("habit-card-evening-run")).toBeInTheDocument();
    });

    // Verify immutable fields were not touched in storage
    const habits = JSON.parse(
      localStorage.getItem("habit-tracker-habits") ?? "[]",
    );
    const updated = habits.find((h: Habit) => h.name === "Evening Run");

    expect(updated).toBeDefined();
    expect(updated.id).toBe(original.id);
    expect(updated.userId).toBe(original.userId);
    expect(updated.createdAt).toBe(original.createdAt);
    expect(updated.completions).toEqual(original.completions);
    expect(updated.frequency).toBe("daily");
  });

  //  Delete

  it("deletes a habit only after explicit confirmation", async () => {
    seedSession();
    seedHabit("Read Books");
    const user = userEvent.setup();
    renderHabitList();

    await waitFor(() => {
      expect(screen.getByTestId("habit-card-read-books")).toBeInTheDocument();
    });

    // Click delete — card should still exist, confirm button should appear
    await user.click(screen.getByTestId("habit-delete-read-books"));

    await waitFor(() => {
      expect(screen.getByTestId("confirm-delete-button")).toBeInTheDocument();
    });

    // Habit must still be visible while awaiting confirmation
    expect(screen.getByTestId("habit-card-read-books")).toBeInTheDocument();

    // Now confirm the deletion
    await user.click(screen.getByTestId("confirm-delete-button"));

    // Habit card must be gone from the DOM
    await waitFor(() => {
      expect(
        screen.queryByTestId("habit-card-read-books"),
      ).not.toBeInTheDocument();
    });

    // Habit must also be removed from localStorage
    const habits = JSON.parse(
      localStorage.getItem("habit-tracker-habits") ?? "[]",
    );
    expect(habits).toHaveLength(0);

    // Empty state should now be visible
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  // Completion toggle

  it("toggles completion and updates the streak display", async () => {
    seedSession();
    seedHabit("Meditate");
    const today = getTodayString();
    const user = userEvent.setup();
    renderHabitList();

    await waitFor(() => {
      expect(screen.getByTestId("habit-card-meditate")).toBeInTheDocument();
    });

    const streakEl = screen.getByTestId("habit-streak-meditate");

    // Streak starts at 0 — habit has no completions
    expect(streakEl).toHaveTextContent("0");

    // Mark complete for today
    await user.click(screen.getByTestId("habit-complete-meditate"));

    // Streak must immediately update to 1
    await waitFor(() => {
      expect(screen.getByTestId("habit-streak-meditate")).toHaveTextContent(
        "1",
      );
    });

    // Verify today's date is in completions in storage
    const after = JSON.parse(
      localStorage.getItem("habit-tracker-habits") ?? "[]",
    );
    expect(after[0].completions).toContain(today);

    // Unmark — click again to toggle off
    await user.click(screen.getByTestId("habit-complete-meditate"));

    // Streak must drop back to 0
    await waitFor(() => {
      expect(screen.getByTestId("habit-streak-meditate")).toHaveTextContent(
        "0",
      );
    });

    // Completion must be removed from storage
    const final = JSON.parse(
      localStorage.getItem("habit-tracker-habits") ?? "[]",
    );
    expect(final[0].completions).not.toContain(today);
  });
});
