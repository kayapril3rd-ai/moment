import type { CheScheduleItem } from '../types/che';
import { buildCheScheduleForDate } from '../data/cheSchedule.ts';

export function getCheScheduleForDate(
  dateKey: string,
  runtimeItems: CheScheduleItem[],
): CheScheduleItem[] {
  const runtimeForDate = runtimeItems.filter((item) => item.dateKey === dateKey);
  const exactSharedItems = runtimeForDate.filter(isExactSharedItem);
  const baseSchedule = buildCheScheduleForDate(dateKey)
    .map((baseItem) => truncateBaseItemBeforeShared(baseItem, exactSharedItems))
    .filter((item): item is CheScheduleItem => item !== null);
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

function truncateBaseItemBeforeShared(
  baseItem: CheScheduleItem,
  exactSharedItems: CheScheduleItem[],
): CheScheduleItem | null {
  const baseStart = parseClockMinutes(baseItem.startTime);
  const baseEnd = parseClockMinutes(baseItem.endTime);
  if (baseStart === null || baseEnd === null) return baseItem;

  const interruptAt = exactSharedItems.reduce<number | null>((earliest, sharedItem) => {
    const sharedStart = parseClockMinutes(sharedItem.startTime);
    const sharedEnd = parseClockMinutes(sharedItem.endTime);
    if (sharedStart === null || sharedEnd === null) return earliest;
    const overlaps = baseStart < sharedEnd && sharedStart < baseEnd;
    if (!overlaps) return earliest;
    return earliest === null ? sharedStart : Math.min(earliest, sharedStart);
  }, null);

  if (interruptAt === null) return baseItem;
  if (interruptAt <= baseStart) return null;

  const endTime = formatClockMinutes(interruptAt);
  return {
    ...baseItem,
    id: `${baseItem.id}-before-shared`,
    endTime,
    timeLabel: `${baseItem.startTime}–${endTime}`,
  };
}

function parseClockMinutes(value: string | null): number | null {
  const match = value?.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (minutes > 59 || hours > 24 || (hours === 24 && minutes !== 0)) return null;
  return hours * 60 + minutes;
}

function formatClockMinutes(value: number): string {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
