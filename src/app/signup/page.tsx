import Image from "next/image";
import SignupForm from "../components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen px-6 py-10 flex flex-col">
      {/* HEADER */}
      <header className="w-full mb-10 flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          Habit Tracker
        </h1>

        <p className="hidden md:block text-sm text-gray-400">
          Build. Track. Grow.
        </p>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid md:grid-cols-2 gap-10 w-full max-w-6xl items-center">
          {/* LEFT SIDE */}
          <div className="hidden md:flex justify-center">
            <Image
              src="/undraw_morning-plans_5vln.svg"
              width={500}
              height={500}
              alt="Morning plans"
              className="w-[80%] opacity-90"
            />
          </div>

          {/* RIGHT SIDE */}
          <div className="w-full">
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  );
}
