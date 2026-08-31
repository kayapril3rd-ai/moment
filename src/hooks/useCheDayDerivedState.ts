import { useMemo } from 'react';
import type { CheCurrentState, CheNotification, CheScheduleItem, DayRecord, SceneCard, UserPlan } from '../types/che';
import { resolveCheCurrentState } from '../utils/cheCurrentState.ts';
import { toDateKey } from '../utils/date';
import { parseClockMinutes } from '../utils/eventStatus';
import { getUserPlanDateKey } from '../utils/plan';

interface UseCheDayDerivedStateInput {
  activeActivityId: string | null;
  activeStartedAt: string | null;
  cheSchedule: CheScheduleItem[];
  dayRecords: DayRecord[];
  now: number;
  sceneCards: SceneCard[];
  userPlans: UserPlan[];
}

export function useCheDayDerivedState({
  activeActivityId,
  activeStartedAt,
  cheSchedule,
  dayRecords,
  now,
  sceneCards,
  userPlans,
}: UseCheDayDerivedStateInput) {
  const todayKey = toDateKey(new Date(now));
  const todayPlans = useMemo(
    () => userPlans.filter((plan) => getUserPlanDateKey(plan) === todayKey),
    [todayKey, userPlans],
  );
  const todayCheSchedule = useMemo(() => cheSchedule.filter((item) => item.dateKey === todayKey), [cheSchedule, todayKey]);

  const activeActivityCard = useMemo(
    () => sceneCards.find((card) => card.id === activeActivityId && card.status === 'active') ?? null,
    [activeActivityId, sceneCards],
  );

  const cheCurrentState = useMemo(
    () => resolveCheCurrentState({ now, cheSchedule: todayCheSchedule, activeActivityCard, activeStartedAt }),
    [activeActivityCard, activeStartedAt, now, todayCheSchedule],
  );

  return {
    activeActivityCard,
    cheCurrentState,
    companionshipStats: createCompanionshipStats(activeStartedAt, now, dayRecords),
    notifications: createNotifications(todayPlans, todayKey, cheCurrentState),
    userTodaySummary: createUserTodaySummary(todayPlans),
  };
}

function createUserTodaySummary(userPlans: UserPlan[]) {
  const activePlan = userPlans.find((plan) => plan.status === 'active');
  const nextPlan = userPlans.find((plan) => plan.status === 'todo');
  const todoCount = userPlans.filter((plan) => plan.status === 'todo').length;
  const acceptedCount = userPlans.filter(
    (plan) => plan.inviteStatus === 'accepted' && plan.status !== 'done' && plan.status !== 'cancelled',
  ).length;
  const activeCount = userPlans.filter((plan) => plan.status === 'active').length;
  const doneCount = userPlans.filter((plan) => plan.status === 'done').length;
  const countHint = `${todoCount}待做 · ${doneCount}完成`;

  if (userPlans.length === 0) return { activeCount, acceptedCount, detail: '可以先加一件小事', title: '今天还没安排', todoCount };
  if (doneCount === userPlans.length) return { activeCount, acceptedCount, detail: '已经很好了', title: `今天完成了 ${doneCount} 件`, todoCount };
  if (activePlan) return { activeCount, acceptedCount, detail: countHint, title: `正在做：${compactPlanTitle(activePlan.title)}`, todoCount };
  if (nextPlan) return { activeCount, acceptedCount, detail: countHint, title: `下个：${compactPlanTitle(nextPlan.title)}`, todoCount };
  return { activeCount, acceptedCount, detail: countHint, title: '今天还没安排', todoCount };
}

function compactPlanTitle(title: string) {
  const value = title.trim();
  return value.length > 6 ? `${value.slice(0, 6)}…` : value;
}

function createCompanionshipStats(activeStartedAt: string | null, now: number, dayRecords: DayRecord[]) {
  const todayKey = toDateKey(new Date(now));
  const completedMinutes = dayRecords
    .filter((record) => record.kind === 'activity' && record.owner === 'mine' && record.dateKey === todayKey)
    .reduce((sum, record) => sum + getRecordDurationMinutes(record), 0);
  const activeMinutes = activeStartedAt ? Math.max(0, Math.floor((now - new Date(activeStartedAt).getTime()) / 60_000)) : 0;
  const totalMinutes = completedMinutes + activeMinutes;
  return {
    activeMinutes,
    completedMinutes,
    detail: activeMinutes > 0 ? '正在一起的时间也会算进去' : '从真正开始陪伴后计算',
    title: formatCompanionMinutes(totalMinutes),
    totalMinutes,
  };
}

function createNotifications(plans: UserPlan[], dateKey: string, cheCurrentState: CheCurrentState): CheNotification[] {
  const reminders = plans
    .filter((plan) => plan.status !== 'done' && (plan.startTime || plan.inviteStatus === 'accepted'))
    .slice(0, 4)
    .map((plan) => ({
      id: `notify-${plan.id}`,
      type: 'plan_reminder' as const,
      content: getPlanReminderText(plan),
      dateKey,
      planId: plan.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    }));
  const activity = cheCurrentState.source === 'shared_activity'
    ? `正和你${cheCurrentState.activity}`
    : `正在${cheCurrentState.activity}`;
  const cheMessage: CheNotification = {
    id: 'notify-che-current-state',
    type: 'che_message',
    content: `澈${activity}，在${cheCurrentState.location}。`,
    dateKey,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  return [cheMessage, ...reminders].slice(0, 5);
}

function getPlanReminderText(plan: UserPlan) {
  if (plan.title.includes('面试')) return '面试那件事，我记着。';
  if (plan.title.includes('散步')) return '晚点散步，我还在。';
  if (plan.title.includes('吃')) return '记得吃点热的。';
  if (plan.startTime) return `${plan.startTime} 那件事，我记着。`.slice(0, 20);
  return `${plan.title}，我还在。`.slice(0, 20);
}

function formatCompanionMinutes(minutes: number): string {
  if (minutes <= 0) return '今天刚开始';
  if (minutes < 60) return `${minutes} 分钟`;
  return `${Math.floor(minutes / 60)} 小时 ${minutes % 60} 分钟`;
}

function getRecordDurationMinutes(record: DayRecord): number {
  if (!record.startedAt || !record.endedAt) return 0;
  const start = parseClockMinutes(record.startedAt);
  const end = parseClockMinutes(record.endedAt);
  if (start === null || end === null || end <= start) return 0;
  return end - start;
}
