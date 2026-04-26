// export function isValidHabitName(name: string): boolean {
//   return name.trim().length > 0 && name.trim().length <= 100
// }

export function validateHabitName(name: string): { valid: boolean;
value: string;
error: string | null } {
  const value = name.trim();
  if (value.length < 1) {
    return {valid: false, value: '', error: 'Habit name is required'}
  } else if (value.length > 60) {
    return {
      valid: false,
      value,
      error: 'Habit name must be 60 characters or fewer'
    }
  } else {
    return { valid: true, value, error: null}
  }
}
