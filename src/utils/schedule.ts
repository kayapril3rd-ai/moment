import type { CheScheduleItem, UserPlan } from '../types/che';

export function getScheduleCount(userPlans: UserPlan[], cheSchedule: CheScheduleItem[]): number {
  return userPlans.length + cheSchedule.length;
}

export function getNextSharedSchedule(cheSchedule: CheScheduleItem[]): CheScheduleItem | undefined {
  return cheSchedule.find((item) => item.type === 'shared');
}
