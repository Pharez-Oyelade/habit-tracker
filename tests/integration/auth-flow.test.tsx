import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "@/context/AuthContext";
import LoginForm from "@/app/components/auth/LoginForm";
import SignupForm from "@/app/components/auth/SignupForm";
import type { User } from "@/types/auth";

// LoginForm and SignupForm call router.push on success

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

function renderWithAuth(ui: React.ReactElement) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

function seedUser(email: string, password: string): User {
  const user: User = {
    id: "seed-user-id",
    email,
    password,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem("habit-tracker-users", JSON.stringify([user]));
  return user;
}

// Tests

describe("auth flow", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // Signup

  it("submits the signup form and creates a session", async () => {
    const user = userEvent.setup();
    renderWithAuth(<SignupForm />);

    await user.type(
      screen.getByTestId("auth-signup-email"),
      "newuser@example.com",
    );
    await user.type(
      screen.getByTestId("auth-signup-password"),
      "securepass123",
    );
    await user.click(screen.getByTestId("auth-signup-submit"));

    // Session must be written to localStorage
    const raw = localStorage.getItem("habit-tracker-session");
    const session = JSON.parse(raw ?? "null");

    expect(session).not.toBeNull();
    expect(session.email).toBe("newuser@example.com");
    expect(session.userId).toBeTruthy();

    // User record must also exist
    const users = JSON.parse(
      localStorage.getItem("habit-tracker-users") ?? "[]",
    );
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe("newuser@example.com");
  });

  it("shows an error for duplicate signup email", async () => {
    // Seed an existing user
    seedUser("taken@example.com", "existingpass");

    const user = userEvent.setup();
    renderWithAuth(<SignupForm />);

    await user.type(
      screen.getByTestId("auth-signup-email"),
      "taken@example.com",
    );
    await user.type(screen.getByTestId("auth-signup-password"), "newpassword");
    await user.click(screen.getByTestId("auth-signup-submit"));

    expect(screen.getByText("User already exists")).toBeInTheDocument();

    // No new session should have been created
    const session = JSON.parse(
      localStorage.getItem("habit-tracker-session") ?? "null",
    );
    expect(session).toBeNull();

    expect(mockPush).not.toHaveBeenCalled();
  });

  // Login

  it("submits the login form and stores the active session", async () => {
    seedUser("existing@example.com", "correctpass");

    const user = userEvent.setup();
    renderWithAuth(<LoginForm />);

    await user.type(
      screen.getByTestId("auth-login-email"),
      "existing@example.com",
    );
    await user.type(screen.getByTestId("auth-login-password"), "correctpass");
    await user.click(screen.getByTestId("auth-login-submit"));

    const raw = localStorage.getItem("habit-tracker-session");
    const session = JSON.parse(raw ?? "null");

    expect(session).not.toBeNull();
    expect(session.email).toBe("existing@example.com");

    // Should redirect to dashboard after successful login
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("shows an error for invalid login credentials", async () => {
    // No user seeded
    const user = userEvent.setup();
    renderWithAuth(<LoginForm />);

    await user.type(
      screen.getByTestId("auth-login-email"),
      "ghost@example.com",
    );
    await user.type(screen.getByTestId("auth-login-password"), "wrongpassword");
    await user.click(screen.getByTestId("auth-login-submit"));

    expect(screen.getByText("Invalid email or password")).toBeInTheDocument();

    // No session
    const session = JSON.parse(
      localStorage.getItem("habit-tracker-session") ?? "null",
    );
    expect(session).toBeNull();

    expect(mockPush).not.toHaveBeenCalled();
  });
});
