// Derives Today page display state from the shared mock state.
// Keep this file UI-free so TodayPage can stay focused on layout composition.
import { useMemo } from 'react';
import { mockCheStatus, todayCopy } from '../data';
import type { CheStatus, DayRecord, SceneCard, UserPlan } from '../types/che';
import { parseClockMinutes } from '../utils/eventStatus';

interface UseCheDayDerivedStateInput {
  activeActivityId: string | null;
  activeStartedAt: string | null;
  dayRecords: DayRecord[];
  now: number;
  sceneCards: SceneCard[];
  userPlans: UserPlan[];
}

export function useCheDayDerivedState({
  activeActivityId,
  activeStartedAt,
  dayRecords,
  now,
  sceneCards,
  userPlans,
}: UseCheDayDerivedStateInput) {
  const activeActivityCard = useMemo(
    () => sceneCards.find((card) => card.id === activeActivityId && card.status === 'active') ?? null,
    [activeActivityId, sceneCards],
  );

  const upcomingHeroCard = useMemo(
    () =>
      [...sceneCards]
        .filter((card) => ['scheduled', 'availableNow', 'flexible'].includes(card.status))
        .sort((a, b) => getHeroCardPriority(a, now) - getHeroCardPriority(b, now) || a.sortOrder - b.sortOrder)[0] ?? null,
    [sceneCards, now],
  );

  const defaultHeroStatus = activeActivityCard ? createActiveHeroStatus(activeActivityCard) : mockCheStatus;
  const displayHeroStatus = activeActivityCard
    ? defaultHeroStatus
    : upcomingHeroCard
      ? createUpcomingHeroStatus(upcomingHeroCard)
      : defaultHeroStatus;

  const displayHeroActionLabel = activeActivityCard ? '回到场景' : todayCopy.heroActionLabel;
  const userTodaySummary = useMemo(() => createUserTodaySummary(userPlans), [userPlans]);
  const companionshipStats = useMemo(
    () => createCompanionshipStats(activeStartedAt, now, dayRecords),
    [activeStartedAt, now, dayRecords],
  );

  return {
    activeActivityCard,
    companionshipStats,
    displayHeroActionLabel,
    displayHeroStatus,
    upcomingHeroCard,
    userTodaySummary,
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

function createUpcomingHeroStatus(card: SceneCard): CheStatus {
  if (card.status === 'availableNow' || isCardInProgressByTime(card)) {
    return {
      ...mockCheStatus,
      id: `upcoming-${card.id}`,
      period: '现在',
      location: getActiveLocation(card.sceneType),
      currentActivity: card.title,
      detail: card.description,
      availableScenes: [card.sceneType],
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    ...mockCheStatus,
    id: `next-${card.id}`,
    period: getUpcomingPeriod(card),
    currentActivity: card.title,
    detail: card.description,
    availableScenes: [card.sceneType],
    updatedAt: new Date().toISOString(),
  };
}

function getHeroCardPriority(card: SceneCard, now: number) {
  if (isCardInProgressByTime(card)) return 0;
  if (card.status === 'availableNow') return 1;

  const startMinutes = parseClockMinutes(card.timeLabel ?? card.timeHint);
  if (startMinutes === null) return card.status === 'scheduled' ? 3 : 4;

  const current = new Date(now);
  const currentMinutes = current.getHours() * 60 + current.getMinutes();
  return startMinutes >= currentMinutes ? 2 + (startMinutes - currentMinutes) / 1440 : 5;
}

function isCardInProgressByTime(card: SceneCard) {
  const startMinutes = parseClockMinutes(card.timeLabel ?? card.timeHint);
  if (startMinutes === null) return false;

  const current = new Date();
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
  const todoCount = userPlans.filter((plan) => !plan.status || plan.status === 'todo').length;
  const acceptedCount = userPlans.filter((plan) => plan.inviteStatus === 'accepted' || plan.status === 'accepted').length;
  const activeCount = userPlans.filter((plan) => plan.status === 'active').length;
  const nextPlan = userPlans.find((plan) => ['active', 'accepted', 'todo'].includes(plan.status ?? 'todo'));

  return {
    activeCount,
    acceptedCount,
    detail: nextPlan ? `下一件：${nextPlan.title}` : '今天暂时没有新的安排',
    title: `${todoCount} 件待做 · ${acceptedCount} 件已约好${activeCount > 0 ? ` · ${activeCount} 件进行中` : ''}`,
    todoCount,
  };
}

function createCompanionshipStats(activeStartedAt: string | null, now: number, dayRecords: DayRecord[]) {
  const completedMinutes = dayRecords.filter((record) => record.kind === 'activity' && record.owner === 'mine').length * 10;
  const activeMinutes = activeStartedAt ? Math.max(0, Math.floor((now - new Date(activeStartedAt).getTime()) / 60_000)) : 0;
  const totalMinutes = completedMinutes + activeMinutes;

  return {
    activeMinutes,
    completedMinutes,
    detail: activeMinutes > 0 ? '正在一起的时间也在计入' : '比昨天多 32 分钟',
    title: `${Math.max(totalMinutes, activeMinutes ? 1 : 0)} 分钟`,
    totalMinutes,
  };
}

function getActiveLocation(sceneType: SceneCard['sceneType']) {
  const locationMap: Record<SceneCard['sceneType'], string> = {
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
  return locationMap[sceneType];
}

function getActiveDetail(sceneType: SceneCard['sceneType']) {
  const detailMap: Record<SceneCard['sceneType'], string> = {
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
  return detailMap[sceneType];
}
