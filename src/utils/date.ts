export interface DateItem {
  date: Date;
  dateKey: string;
  dayNumber: string;
}

export interface MonthDateItem extends DateItem {
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatMonthDay(dateKeyOrDate: string | Date): string {
  const date = typeof dateKeyOrDate === 'string' ? parseDateKey(dateKeyOrDate) : dateKeyOrDate;
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function formatYearMonth(dateKeyOrDate: string | Date): string {
  const date = typeof dateKeyOrDate === 'string' ? parseDateKey(dateKeyOrDate) : dateKeyOrDate;
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

export function formatMomentTime(createdAt: string, now: number): string {
  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate.getTime())) return '';

  const nowDate = new Date(now);
  const createdKey = toDateKey(createdDate);
  const todayKey = toDateKey(nowDate);
  const elapsedMs = now - createdDate.getTime();
  if (createdKey === todayKey) return elapsedMs >= 0 && elapsedMs < 5 * 60_000 ? '刚刚' : '今天';

  const yesterday = new Date(nowDate);
  yesterday.setDate(nowDate.getDate() - 1);
  if (createdKey === toDateKey(yesterday)) return '昨天';

  if (createdDate.getFullYear() === nowDate.getFullYear()) {
    return `${createdDate.getMonth() + 1}月${createdDate.getDate()}日`;
  }
  return `${createdDate.getFullYear()}年${createdDate.getMonth() + 1}月${createdDate.getDate()}日`;
}

export function buildDateStrip(anchor = new Date(), daysBefore = 1): DateItem[] {
  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(anchor);
    date.setHours(0, 0, 0, 0);
    date.setDate(anchor.getDate() - daysBefore + index);
    return {
      date,
      dateKey: toDateKey(date),
      dayNumber: String(date.getDate()),
    };
  });
}

export function buildMonthDays(monthDate = new Date(), today = new Date()): MonthDateItem[] {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - startOffset);
  const todayKey = toDateKey(today);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const dateKey = toDateKey(date);

    return {
      date,
      dateKey,
      dayNumber: String(date.getDate()),
      isCurrentMonth: date.getMonth() === monthDate.getMonth(),
      isToday: dateKey === todayKey,
    };
  });
}

export function isPastDate(dateKey: string, today = new Date()): boolean {
  return dateKey < toDateKey(today);
}

export function isTodayDate(dateKey: string, today = new Date()): boolean {
  return dateKey === toDateKey(today);
}

export function isFutureDate(dateKey: string, today = new Date()): boolean {
  return dateKey > toDateKey(today);
}
