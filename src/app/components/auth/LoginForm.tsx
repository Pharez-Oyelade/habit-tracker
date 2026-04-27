"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginForm() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    setError(null);

    const result = signIn(email, password);

    if (!result.success) {
      setError(result.error || "An unknown error occurred");
    }
  };

  return (
    <div className="">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
