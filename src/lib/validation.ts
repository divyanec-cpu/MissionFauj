export interface DobCheck {
  valid: boolean;
  age?: number;
  error?: string;
}

/** Age in years (one decimal place) from a birth date to now. */
function ageFromDob(dob: Date, now: Date): number {
  const years = (now.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return Math.round(years * 10) / 10;
}

export function checkDob(dobStr: string): DobCheck {
  if (!dobStr) return { valid: false, error: 'Enter a date of birth.' };
  const dob = new Date(dobStr + 'T00:00:00');
  if (Number.isNaN(dob.getTime())) return { valid: false, error: 'Enter a valid date.' };
  const now = new Date();
  if (dob > now) return { valid: false, error: 'Date of birth cannot be in the future.' };
  const age = ageFromDob(dob, now);
  if (age < 10) return { valid: false, error: 'Age must be at least 10 years.' };
  if (age > 60) return { valid: false, error: 'Age must be under 60 years.' };
  return { valid: true, age };
}

export function isValidName(name: string): boolean {
  return /^[A-Za-z][A-Za-z .'-]{1,49}$/.test(name.trim());
}

/** 10-digit Indian mobile number, starting 6-9 (no +91 prefix — that's added separately). */
export function isValidIndianMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile.trim());
}
