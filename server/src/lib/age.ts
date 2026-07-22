// Server-side age computation from a real date of birth — the DPDP-compliance
// gate depends entirely on this never being a client-declared value (see
// routes/auth.ts confirm-age). One decimal place, matching the frontend
// eligibility engine's own precision (src/lib/validation.ts) — NDA joining
// age bands are half-year granular (16.5-19.5), so a whole-year age would
// silently break that scan downstream.
export function calendarAge(dob: Date, today: Date = new Date()): number {
  const years = (today.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return Math.round(years * 10) / 10;
}

export function parseDob(day: number, month: number, year: number, today: Date = new Date()): Date {
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    throw new Error('Enter your full date of birth.');
  }
  if (String(year).length !== 4 || month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error('That date looks invalid. Check the day, month and year.');
  }
  const dob = new Date(year, month - 1, day);
  if (dob.getFullYear() !== year || dob.getMonth() !== month - 1 || dob.getDate() !== day) {
    throw new Error("That date doesn't exist. Check the day and month.");
  }
  if (dob > today) {
    throw new Error('Date of birth cannot be in the future.');
  }
  return dob;
}
