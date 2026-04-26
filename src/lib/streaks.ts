export function calculateCurrentStreak(completions: string[], today?: string): number {
  const unique = [...new Set(completions)].sort();
  const todayStr = today ?? new Date().toISOString().slice(0, 10);

  if (!unique.includes(todayStr)) return 0

  let streak = 0;
  const cursor = new Date(todayStr + 'T00:00:00Z');

  while (true) {
    const dateStr = cursor.toISOString().slice(0,10);
    if(!unique.includes(dateStr)) break;

    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}