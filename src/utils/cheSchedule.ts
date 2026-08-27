import type { CheScheduleItem } from '../types/che';
import { buildCheScheduleForDate } from '../data/cheSchedule.ts';

export function getCheScheduleForDate(
  dateKey: string,
  runtimeItems: CheScheduleItem[],
): CheScheduleItem[] {
  const runtimeForDate = runtimeItems.filter((item) => item.dateKey === dateKey);
  return [...buildCheScheduleForDate(dateKey), ...runtimeForDate].sort(compareScheduleItems);
}

function compareScheduleItems(left: CheScheduleItem, right: CheScheduleItem): number {
  return left.startTime.localeCompare(right.startTime) || left.id.localeCompare(right.id);
}
