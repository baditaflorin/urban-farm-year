export function monthDayToDate(year: number, monthDay: string): Date {
  const [month, day] = monthDay.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return isoDate(new Date());
}

export function displayDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
    new Date(`${value}T12:00:00Z`),
  );
}

export function displayLongDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00Z`));
}

export function daysBetween(a: string, b: string): number {
  const start = new Date(`${a}T12:00:00Z`).getTime();
  const end = new Date(`${b}T12:00:00Z`).getTime();
  return Math.round((end - start) / 86_400_000);
}

export function thisGardenYear(): number {
  return new Date().getFullYear();
}
