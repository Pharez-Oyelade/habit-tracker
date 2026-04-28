export default function EmptyState({ onClick }: { onClick: () => void }) {
  return (
    <div
      data-testid="empty-state"
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 cursor-pointer border-dashed border-indigo-200 text-indigo-400 bg-indigo-100"
        onClick={() => onClick()}
        aria-label="Add habit"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M14 7v14M7 14h14"
            stroke="var(--color-indigo-400)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <p className="text-base font-semibold mb-1 text-gray-50">No habits yet</p>
      <p className="text-sm max-w-[220px] leading-relaxed text-gray-400">
        Tap the plus icon to start building your daily rituals.
      </p>
    </div>
  );
}
