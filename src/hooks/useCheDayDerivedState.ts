import { useMemo } from 'react';
import { mockCheStatus } from '../data';
import type { CheNotification, CheScheduleItem, CheStatus, DayRecord, SceneCard, UserPlan } from '../types/che';
import { toDateKey } from '../utils/date';
import { parseClockMinutes } from '../utils/eventStatus';

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
  const todayPlans = useMemo(() => userPlans.filter((plan) => (plan.dateKey ?? todayKey) === todayKey), [todayKey, userPlans]);
  const todayCheSchedule = useMemo(() => cheSchedule.filter((item) => (item.dateKey ?? todayKey) === todayKey), [cheSchedule, todayKey]);

  const activeActivityCard = useMemo(
    () => sceneCards.find((card) => card.id === activeActivityId && card.status === 'active') ?? null,
    [activeActivityId, sceneCards],
  );

  const upcomingHeroCard = useMemo(
    () =>
      [...sceneCards]
        .filter((card) => card.status === 'scheduled')
        .sort((a, b) => getHeroCardPriority(a, now) - getHeroCardPriority(b, now) || a.sortOrder - b.sortOrder)[0] ?? null,
    [sceneCards, now],
  );

  const cheTodayStatus = useMemo(() => createCheTodayStatus(todayCheSchedule, now), [now, todayCheSchedule]);
  const defaultHeroStatus = createDefaultHeroStatus(cheTodayStatus);
  const displayHeroStatus = activeActivityCard
    ? createActiveHeroStatus(activeActivityCard)
    : upcomingHeroCard
      ? createUpcomingHeroStatus(upcomingHeroCard, now)
      : defaultHeroStatus;

  return {
    activeActivityCard,
    cheTodayStatus,
    companionshipStats: createCompanionshipStats(activeStartedAt, now, dayRecords),
    displayHeroActionLabel: '去找他',
    displayHeroStatus,
    notifications: createNotifications(todayPlans, todayCheSchedule, todayKey),
    upcomingHeroCard,
    userTodaySummary: createUserTodaySummary(todayPlans),
  };
}

function createDefaultHeroStatus(cheStatus: { title: string; detail: string; sceneType?: SceneCard['sceneType'] }): CheStatus {
  return {
    ...mockCheStatus,
    currentActivity: cheStatus.title,
    detail: cheStatus.detail,
    availableScenes: [cheStatus.sceneType ?? 'study'],
  };
}

function createActiveHeroStatus(card: SceneCard): CheStatus {
  return {
    ...mockCheStatus,
    id: `active-${card.id}`,
    period: '现在',
    location: getActiveLocation(card.sceneType),
    currentActivity: `你们正在${card.title}`,
    detail: getActiveDetail(card.sceneType),
    availableScenes: [card.sceneType],
    updatedAt: new Date().toISOString(),
  };
}

function createUpcomingHeroStatus(card: SceneCard, now: number): CheStatus {
  return {
    ...mockCheStatus,
    id: `next-${card.id}`,
    period: isCardInProgressByTime(card, now) ? '现在' : getUpcomingPeriod(card),
    location: getActiveLocation(card.sceneType),
    currentActivity: card.title,
    detail: card.description,
    availableScenes: [card.sceneType],
    updatedAt: new Date().toISOString(),
  };
}

function getHeroCardPriority(card: SceneCard, now: number) {
  if (isCardInProgressByTime(card, now)) return 0;
  const startMinutes = parseClockMinutes(card.timeLabel ?? card.timeHint);
  if (startMinutes === null) return card.status === 'scheduled' ? 3 : 4;
  const current = new Date(now);
  const currentMinutes = current.getHours() * 60 + current.getMinutes();
  return startMinutes >= currentMinutes ? 2 + (startMinutes - currentMinutes) / 1440 : 5;
}

function isCardInProgressByTime(card: SceneCard, now: number) {
  const startMinutes = parseClockMinutes(card.timeLabel ?? card.timeHint);
  if (startMinutes === null) return false;
  const current = new Date(now);
  const currentMinutes = current.getHours() * 60 + current.getMinutes();
  return currentMinutes >= startMinutes && currentMinutes < startMinutes + 60;
}

function getUpcomingPeriod(card: SceneCard) {
  const label = card.timeLabel ?? card.timeHint;
  if (label.includes('睡前')) return '睡前';
  if (label.includes('晚')) return '今晚';
  if (label.includes('下午')) return '下午';
  return '稍后';
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
  return {
    activeCount,
    acceptedCount,
    detail: countHint,
    title: '今天还没安排',
    todoCount,
  };
}

function compactPlanTitle(title: string) {
  const value = title.trim();
  return value.length > 6 ? `${value.slice(0, 6)}…` : value;
}

function createCheTodayStatus(schedule: CheScheduleItem[], now: number) {
  const currentMinutes = new Date(now).getHours() * 60 + new Date(now).getMinutes();
  const sorted = [...schedule].sort((a, b) => (parseClockMinutes(a.startTime || a.timeLabel || '') ?? 9999) - (parseClockMinutes(b.startTime || b.timeLabel || '') ?? 9999));
  const current = sorted.find((item) => {
    const start = parseClockMinutes(item.startTime || item.timeLabel || '');
    return start !== null && currentMinutes >= start && currentMinutes < start + 90;
  });
  const next = sorted.find((item) => {
    const start = parseClockMinutes(item.startTime || item.timeLabel || '');
    return start !== null && start > currentMinutes;
  });
  const item = current ?? next ?? sorted.find((entry) => entry.status === 'available') ?? sorted[sorted.length - 1];
  if (!item) return { title: '在你身边', detail: '今天也可以慢慢来。', sceneType: 'study' as const };
  return { title: item.title, detail: item.timeLabel ? `${item.timeLabel} · ${item.detail}` : item.detail, sceneType: item.sceneType ?? 'study' };
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

function createNotifications(plans: UserPlan[], schedule: CheScheduleItem[], dateKey: string): CheNotification[] {
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
  const freeItem = schedule.find((item) => item.timeLabel?.includes('20:30') || item.status === 'available');
  const cheMessage: CheNotification = {
    id: 'notify-che-free',
    type: 'che_message',
    content: freeItem ? '我 20:30 后会空。' : '我刚忙完，可以陪你。',
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

function getActiveLocation(sceneType: SceneCard['sceneType']) {
  const map: Record<SceneCard['sceneType'], string> = {
    commute: '路上',
    deep_room: '窗边',
    fitness: '健身房',
    gaming: '书桌边',
    idle: '身边',
    meal: '餐桌旁',
    sleep: '睡前',
    study: '书桌边',
    watch: '客厅',
  };
  return map[sceneType];
}

function getActiveDetail(sceneType: SceneCard['sceneType']) {
  const map: Record<SceneCard['sceneType'], string> = {
    commute: '路上的时间也可以放慢一点，他陪你一起过去。',
    deep_room: '你可以慢一点说，他会把这段时间留得安静些。',
    fitness: '他会陪你开始，不用一下子练得太狠。',
    gaming: '他把节奏放轻一点，陪你玩一会儿。',
    idle: '他在这里，陪你把这一小段时间过稳。',
    meal: '他会陪你先好好吃点东西，不急着聊别的。',
    sleep: '灯光放低了些，他会陪你慢慢收尾今天。',
    study: '他也把电脑打开了，陪你一起安静进入状态。',
    watch: '他去倒了杯水，坐回沙发边。',
  };
  return map[sceneType];
}
