import type { UserPlan } from '../types/che';
import { toDateKey } from './date';

export type ComputedEventStatus = 'in_progress' | 'upcoming' | 'done' | 'floating';

export function getPlanComputedStatus(plan: Pick<UserPlan, 'startTime' | 'timeLabel' | 'status' | 'inviteStatus'>, dateKey: string, now = new Date()): ComputedEventStatus {
  const todayKey = toDateKey(now);

  if (dateKey < todayKey) return 'done';
  if (dateKey > todayKey) return 'upcoming';
  if (plan.status === 'active') return 'in_progress';
  if (plan.status === 'done') return 'done';

  const startMinutes = parseClockMinutes(plan.startTime || plan.timeLabel || '');
  if (startMinutes === null) return 'floating';

  const durationMinutes = getSoftDurationMinutes(plan.timeLabel || '', plan.startTime || '');
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const endMinutes = startMinutes + durationMinutes;

  if (currentMinutes >= startMinutes && currentMinutes < endMinutes) return 'in_progress';
  if (currentMinutes >= endMinutes) return 'done';
  return 'upcoming';
}

export function getStatusLabel(status: ComputedEventStatus, plan: Pick<UserPlan, 'status' | 'inviteStatus'>): string {
  if (status === 'in_progress') return '进行中';
  if (status === 'done') return '已完成';
  if (plan.status === 'accepted' || plan.inviteStatus === 'accepted') return '已约好';
  return '邀请澈';
}

export function parseClockMinutes(value: string): number | null {
  const match = value.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function getSoftDurationMinutes(timeLabel: string, startTime: string): number {
  if (/电影|90/.test(timeLabel)) return 90;
  if (/10:00/.test(startTime) || /学习|60/.test(timeLabel)) return 60;
  return 45;
}
