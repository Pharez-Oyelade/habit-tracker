"use client";

import ProtectedRoute from "../components/shared/ProtectedRoute";
import HabitList from "../components/habits/HabitList";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main data-testid="dashboard-page">
        <HabitList />
      </main>
    </ProtectedRoute>
  );
}
