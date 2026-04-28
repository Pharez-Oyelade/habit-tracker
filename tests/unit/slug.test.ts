import {describe, it, expect} from 'vitest'
import { getHabitSlug } from '@/lib/slug'

describe('getHabitSlug', () => {
  it('returns lowercase hyphenated slug for a basic habit name', () => {
    expect(getHabitSlug('Drink Water')).toBe('drink-water');
    expect(getHabitSlug('Read Books')).toBe('read-books');
  });

  it('trims outer spaces and collapses reapeated internal spaces', () => {
    expect(getHabitSlug('  Drink Water  ')).toBe('drink-water');
    expect(getHabitSlug(' Read   Books ')).toBe('read-books');
  })

  it('removes non alphanumeric characters except hyphens', () => {
    expect(getHabitSlug('Drink! Water@')).toBe('drink-water');
    expect(getHabitSlug('Exercise (30min)')).toBe('exercise-30min');
    expect(getHabitSlug('Meditate - 5 mins')).toBe('meditate-5-mins');
  })
})