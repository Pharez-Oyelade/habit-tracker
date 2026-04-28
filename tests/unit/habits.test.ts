import  {describe, it, expect} from 'vitest'
import { toggleHabitCompletion } from '@/lib/habits'
import type { Habit } from '@/types/habit'

const baseHabit: Habit = {
  id: 'h1',
  userId: 'u1',
  name: 'Read a book',
  description: '',
  frequency: 'daily',
  createdAt: '2026-01-01T00:00:00.000Z',
  completions: []
}

describe('toggleHabitCompletion', () => {
  it('adds a completion date when the date is not present', () => {
    const result = toggleHabitCompletion(baseHabit, '2026-01-10');
    expect(result.completions).toContain('2026-01-10')
  })

  it('removes a completion date when the date already exists', () => {
    const habit = {...baseHabit, completions: ['2026-01-10']}
    const result = toggleHabitCompletion(habit, '2026-01-10');
    expect(result.completions).not.toContain('2026-01-10');
  })

  it('does not mutate the original habit object', () => {
    const habit = {...baseHabit, completions: ['2026-01-09']}
    toggleHabitCompletion(habit, '2026-01-10');
    expect(habit.completions).toEqual(['2026-01-09'])
  })

  it('does not return duplicate completion dates', () => {
    const habit = {...baseHabit, completions: ['2026-01-10']};
    
    const first = toggleHabitCompletion(baseHabit, '2026-01-10');
    const withDuplicate = {...baseHabit, completions: ['2026-01-10', '2026-01-10']};
    const result = toggleHabitCompletion(withDuplicate, '2026-01-11');
    const count = result.completions.filter((date) => date === '2026-01-10').length
    expect(count).toBe(1)
  })
})