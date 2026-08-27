import type {
  AgentSceneDefinition,
  CheAvailability,
  CheCurrentState,
  CheScheduleItem,
  SceneCard,
} from '../types/che';
import { AGENT_SCENE_BY_SCENE_TYPE } from './agentSceneContext.ts';
import { parseDateKey, toDateKey } from './date.ts';

export interface ResolveCheCurrentStateInput {
  now: Date | number;
  cheSchedule: CheScheduleItem[];
  activeActivityCard: SceneCard | null;
  activeStartedAt?: string | null;
}

export function resolveCheCurrentState({
  now,
  cheSchedule,
  activeActivityCard,
  activeStartedAt,
}: ResolveCheCurrentStateInput): CheCurrentState {
  const currentDate = typeof now === 'number' ? new Date(now) : now;

  if (activeActivityCard) {
    return {
      source: 'shared_activity',
      activity: activeActivityCard.title,
      detail: activeActivityCard.description,
      location: getWorldLocation(AGENT_SCENE_BY_SCENE_TYPE[activeActivityCard.sceneType]),
      availability: 'available',
      worldScene: { ...AGENT_SCENE_BY_SCENE_TYPE[activeActivityCard.sceneType] },
      entrySceneType: activeActivityCard.sceneType,
      ...(activeStartedAt ? { startedAt: activeStartedAt } : {}),
    };
  }

  const currentItem = findCurrentScheduleItem(currentDate, cheSchedule);
  if (currentItem) {
    const dateKey = currentItem.dateKey ?? toDateKey(currentDate);
    return {
      source: 'schedule',
      activity: currentItem.title,
      detail: currentItem.detail,
      location: getWorldLocation(currentItem.worldScene),
      availability: getWorldAvailability(currentItem.worldScene),
      worldScene: { ...currentItem.worldScene },
      entrySceneType: currentItem.sceneType,
      scheduleItemId: currentItem.id,
      startedAt: toDateTime(dateKey, currentItem.startTime),
      endsAt: toDateTime(dateKey, currentItem.endTime),
    };
  }

  return {
    source: 'default_rhythm',
    activity: '休息',
    detail: '现在是没有安排的日常空档。',
    location: '家里',
    availability: 'available',
    worldScene: { ...AGENT_SCENE_BY_SCENE_TYPE.idle },
    entrySceneType: 'idle',
  };
}

export function formatCheCurrentStateForAgent(state: CheCurrentState): string {
  const activity = state.source === 'shared_activity'
    ? `正和你${state.activity}`
    : `在${state.location}${state.activity}`;
  return `澈现在${activity}。${state.detail}`;
}

function findCurrentScheduleItem(now: Date, schedule: CheScheduleItem[]): CheScheduleItem | undefined {
  const dateKey = toDateKey(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return schedule.find((item) => {
    if (item.dateKey && item.dateKey !== dateKey) return false;
    if (!item.endTime) return false;
    const start = parseExactTime(item.startTime);
    const end = parseExactTime(item.endTime);
    return start !== null && end !== null && currentMinutes >= start && currentMinutes < end;
  });
}

function parseExactTime(value: string): number | null {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (minutes > 59 || hours > 24 || (hours === 24 && minutes !== 0)) return null;
  return hours * 60 + minutes;
}

function toDateTime(dateKey: string, time: string | null): string | undefined {
  if (!time) return undefined;
  if (time !== '24:00') return `${dateKey}T${time}:00`;
  const nextDate = parseDateKey(dateKey);
  nextDate.setDate(nextDate.getDate() + 1);
  return `${toDateKey(nextDate)}T00:00:00`;
}

function getWorldAvailability(worldScene: AgentSceneDefinition): CheAvailability {
  switch (worldScene.sceneKey) {
    case 'home_idle':
    case 'meal':
    case 'deep_room':
      return 'available';
    case 'focus':
    case 'fitness':
    case 'commute':
    case 'hangout':
    case 'errand':
      return 'lightly_available';
  }
}

function getWorldLocation(worldScene: AgentSceneDefinition): string {
  switch (worldScene.sceneVariant) {
    case 'work_desk':
      return '书桌前';
    case 'cooking':
      return '餐桌旁';
    case 'home_gym':
      return '家中运动区';
    case 'city_evening':
      return '城市街道上';
    case 'movie_night':
    case 'gaming_sofa':
    case 'sofa_evening':
      return '客厅里';
    case 'bedside_night':
      return '卧室里';
    case 'window_night':
      return '窗边';
    case 'park':
      return '公园里';
    case 'seaside':
      return '海边';
    case 'grocery':
      return '附近商店里';
  }
}
