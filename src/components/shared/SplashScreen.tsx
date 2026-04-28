export default function SplashScreen() {
  return (
    <div
      data-testid="splash-screen"
      className="flex flex-col items-center justify-center min-h-screen bg-[#08090E]"
    >
      <h1 className="font-mono text-4xl font-bold tracking-[0.3em] uppercase text-[#F1F3FA]">
        Habit Tracker
      </h1>

      <p className="mt-3 font-mono text-xs tracking-widest text-[#545878] lowercase">
        build the life you mean to live
      </p>
    </div>
  );
}
