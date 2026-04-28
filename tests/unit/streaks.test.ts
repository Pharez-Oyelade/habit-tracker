/* MENTOR_TRACE_STAGE3_HABIT_A91 */
import {describe, it, expect} from 'vitest';
import { calculateCurrentStreak } from '@/lib/streaks';

describe('calculateCurrentStreak', () => {
  const today = '2026-01-15';
  const yesterday = '2026-01-14'
  const twoDaysAgo = '2026-01-13'
  const threeDaysAgo = '2026-01-12'

it('returns 0 when completions are empty', () => {
  expect(calculateCurrentStreak([], today)).toBe(0)
})

it('returns 0 when today is not completed', () => {
  expect(calculateCurrentStreak([yesterday, twoDaysAgo], today)).toBe(0);
})

it('returs the correct streak for consecutive completed days', () => {
  expect(calculateCurrentStreak([today], today)).toBe(1);
  expect(calculateCurrentStreak([today, yesterday], today)).toBe(2);
  expect(calculateCurrentStreak([today, yesterday, twoDaysAgo], today)).toBe(3);
  // gap
  expect(calculateCurrentStreak([today, twoDaysAgo], today)).toBe(1)
});

it('ignores duplicate completion dates', () => {
  expect(calculateCurrentStreak([today, today, yesterday, yesterday], today)).toBe(2);
})

it('breaks the streak when a calendar day is missing', () => {
  expect(calculateCurrentStreak([today, threeDaysAgo], today)).toBe(1)
})
})