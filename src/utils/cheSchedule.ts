import type { CheScheduleItem } from '../types/che';
import { buildCheScheduleForDate } from '../data/cheSchedule.ts';

export function getCheScheduleForDate(
  dateKey: string,
  runtimeItems: CheScheduleItem[],
): CheScheduleItem[] {
  const runtimeForDate = runtimeItems.filter((item) => item.dateKey === dateKey);
  const exactSharedItems = runtimeForDate.filter(isExactSharedItem);
  const baseSchedule = buildCheScheduleForDate(dateKey).filter(
    (baseItem) => !exactSharedItems.some((sharedItem) => itemsOverlap(baseItem, sharedItem)),
  );
  return [...baseSchedule, ...runtimeForDate].sort(compareScheduleItems);
}

function compareScheduleItems(left: CheScheduleItem, right: CheScheduleItem): number {
  return left.startTime.localeCompare(right.startTime) || left.id.localeCompare(right.id);
}

function isExactSharedItem(item: CheScheduleItem): boolean {
  return item.type === 'shared'
    && item.source !== 'che'
    && parseClockMinutes(item.startTime) !== null
    && parseClockMinutes(item.endTime) !== null;
}

function itemsOverlap(left: CheScheduleItem, right: CheScheduleItem): boolean {
  const leftStart = parseClockMinutes(left.startTime);
  const leftEnd = parseClockMinutes(left.endTime);
  const rightStart = parseClockMinutes(right.startTime);
  const rightEnd = parseClockMinutes(right.endTime);
  if (leftStart === null || leftEnd === null || rightStart === null || rightEnd === null) return false;
  return leftStart < rightEnd && rightStart < leftEnd;
}

function parseClockMinutes(value: string | null): number | null {
  const match = value?.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (minutes > 59 || hours > 24 || (hours === 24 && minutes !== 0)) return null;
  return hours * 60 + minutes;
}
