"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    setError(null);

    const result = signIn(email, password);

    if (!result.success) {
      setError(result.error || "An unknown error occurred");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl space-y-6"
      >
        {/* HEADER */}
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-semibold text-white">Welcome Back</h2>
          <p className="text-gray-400 text-sm">
            Login to continue your journey
          </p>
        </div>

        {/* EMAIL */}
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm text-gray-300">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="you@example.com"
            required
          />
        </div>

        {/* PASSWORD */}
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm text-gray-300">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="••••••••"
            required
          />
        </div>

        {/* ERROR */}
        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-md">
            {error}
          </p>
        )}

        {/* ACTIONS */}
        <div className="flex items-center justify-center gap-3 text-sm">
          <p className="text-gray-400">Don't have an account?</p>
          <Link
            href="/signup"
            className="text-blue-400 hover:text-blue-300 transition"
          >
            Sign Up
          </Link>

          {/* <Link
            href="#"
            className="text-gray-400 hover:text-gray-300 transition"
          >
            Forgot password?
          </Link> */}
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition text-white font-medium shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
