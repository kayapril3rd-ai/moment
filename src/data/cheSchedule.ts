import type { AgentSceneDefinition, CheScheduleItem, SceneType } from '../types/che';
import { AGENT_SCENE_BY_SCENE_TYPE } from '../utils/agentSceneContext.ts';
import { parseDateKey, toDateKey } from '../utils/date.ts';

interface ScheduleItemInput {
  key: string;
  title: string;
  startTime: string;
  endTime: string;
  type: CheScheduleItem['type'];
  sceneType: SceneType | null;
  worldScene: AgentSceneDefinition;
  detail: string;
  iconKey?: string;
}

const HOME_DAY_WORLD_SCENE: AgentSceneDefinition = { sceneKey: 'home_idle', sceneVariant: 'home_day' };

const weekdayEvenings: ReadonlyArray<ScheduleItemInput> = [
  {
    key: 'fitness',
    title: '做常规训练',
    startTime: '19:30',
    endTime: '21:30',
    type: 'life',
    sceneType: 'fitness',
    worldScene: AGENT_SCENE_BY_SCENE_TYPE.fitness,
    detail: '在家做一段常规训练。',
    iconKey: 'fitness',
  },
  {
    key: 'movie',
    title: '看电影',
    startTime: '19:30',
    endTime: '21:30',
    type: 'rest',
    sceneType: 'watch',
    worldScene: AGENT_SCENE_BY_SCENE_TYPE.watch,
    detail: '在客厅看一部电影。',
    iconKey: 'watch',
  },
  {
    key: 'gaming',
    title: '打游戏',
    startTime: '19:30',
    endTime: '21:30',
    type: 'rest',
    sceneType: 'gaming',
    worldScene: AGENT_SCENE_BY_SCENE_TYPE.gaming,
    detail: '在沙发边玩一会儿游戏。',
    iconKey: 'gaming',
  },
  {
    key: 'park',
    title: '散步',
    startTime: '19:30',
    endTime: '21:30',
    type: 'life',
    sceneType: null,
    worldScene: { sceneKey: 'hangout', sceneVariant: 'park' },
    detail: '在公园慢慢走一圈。',
    iconKey: 'walk',
  },
];

const weekendAfternoons: ReadonlyArray<ScheduleItemInput> = [
  {
    key: 'park',
    title: '散步',
    startTime: '14:00',
    endTime: '17:00',
    type: 'life',
    sceneType: null,
    worldScene: { sceneKey: 'hangout', sceneVariant: 'park' },
    detail: '在公园慢慢走一圈。',
    iconKey: 'walk',
  },
  {
    key: 'seaside',
    title: '散步',
    startTime: '14:00',
    endTime: '17:00',
    type: 'life',
    sceneType: null,
    worldScene: { sceneKey: 'hangout', sceneVariant: 'seaside' },
    detail: '在海边慢慢走一段。',
    iconKey: 'walk',
  },
  {
    key: 'grocery',
    title: '买日用品',
    startTime: '14:00',
    endTime: '17:00',
    type: 'life',
    sceneType: null,
    worldScene: { sceneKey: 'errand', sceneVariant: 'grocery' },
    detail: '去附近买些日常需要的东西。',
    iconKey: 'walk',
  },
  {
    key: 'home',
    title: '休息',
    startTime: '14:00',
    endTime: '17:00',
    type: 'rest',
    sceneType: 'idle',
    worldScene: AGENT_SCENE_BY_SCENE_TYPE.idle,
    detail: '下午留在家里休息。',
    iconKey: 'coffee',
  },
];

export function buildCheScheduleForDate(dateKey: string): CheScheduleItem[] {
  const date = parseScheduleDate(dateKey);
  const day = date.getDay();
  const variation = getDateVariation(dateKey);
  return day === 0 || day === 6
    ? buildWeekendSchedule(dateKey, variation)
    : buildWeekdaySchedule(dateKey, variation);
}

function buildWeekdaySchedule(dateKey: string, variation: number): CheScheduleItem[] {
  return [
    createScheduleItem(dateKey, {
      key: 'morning-home',
      title: '慢慢开始一天',
      startTime: '07:30',
      endTime: '09:00',
      type: 'rest',
      sceneType: 'idle',
      worldScene: HOME_DAY_WORLD_SCENE,
      detail: '早上的节奏还比较慢。',
      iconKey: 'sun',
    }),
    createScheduleItem(dateKey, {
      key: 'morning-focus',
      title: '处理体验方案',
      startTime: '09:00',
      endTime: '12:00',
      type: 'work',
      sceneType: 'study',
      worldScene: AGENT_SCENE_BY_SCENE_TYPE.study,
      detail: '在书桌前集中处理手头工作。',
      iconKey: 'study',
    }),
    createScheduleItem(dateKey, {
      key: 'lunch',
      title: '吃午饭',
      startTime: '12:00',
      endTime: '13:00',
      type: 'life',
      sceneType: 'meal',
      worldScene: AGENT_SCENE_BY_SCENE_TYPE.meal,
      detail: '把午饭安稳吃完。',
      iconKey: 'meal',
    }),
    createScheduleItem(dateKey, {
      key: 'afternoon-focus',
      title: '继续处理工作',
      startTime: '13:30',
      endTime: '17:30',
      type: 'work',
      sceneType: 'study',
      worldScene: AGENT_SCENE_BY_SCENE_TYPE.study,
      detail: '下午继续在书桌前工作。',
      iconKey: 'study',
    }),
    createScheduleItem(dateKey, {
      key: 'commute',
      title: '往家走',
      startTime: '17:30',
      endTime: '18:30',
      type: 'life',
      sceneType: 'commute',
      worldScene: AGENT_SCENE_BY_SCENE_TYPE.commute,
      detail: '正在城市里移动回家。',
      iconKey: 'walk',
    }),
    createScheduleItem(dateKey, weekdayEvenings[variation % weekdayEvenings.length]),
    createScheduleItem(dateKey, {
      key: 'late-home',
      title: '休息',
      startTime: '22:00',
      endTime: '24:00',
      type: 'rest',
      sceneType: 'idle',
      worldScene: AGENT_SCENE_BY_SCENE_TYPE.idle,
      detail: '晚上留在家里，节奏已经慢下来。',
      iconKey: 'moon',
    }),
  ];
}

function buildWeekendSchedule(dateKey: string, variation: number): CheScheduleItem[] {
  const homeEveningScene = variation % 2 === 0
    ? AGENT_SCENE_BY_SCENE_TYPE.watch
    : AGENT_SCENE_BY_SCENE_TYPE.gaming;
  const homeEveningType: SceneType = variation % 2 === 0 ? 'watch' : 'gaming';
  return [
    createScheduleItem(dateKey, {
      key: 'late-morning',
      title: '慢慢醒来',
      startTime: '08:30',
      endTime: '10:30',
      type: 'rest',
      sceneType: 'idle',
      worldScene: HOME_DAY_WORLD_SCENE,
      detail: '周末早上的节奏比较慢。',
      iconKey: 'sun',
    }),
    createScheduleItem(dateKey, {
      key: 'brunch',
      title: '吃点东西',
      startTime: '11:00',
      endTime: '12:30',
      type: 'life',
      sceneType: 'meal',
      worldScene: AGENT_SCENE_BY_SCENE_TYPE.meal,
      detail: '在家把这一餐慢慢吃完。',
      iconKey: 'meal',
    }),
    createScheduleItem(dateKey, weekendAfternoons[variation % weekendAfternoons.length]),
    createScheduleItem(dateKey, {
      key: 'dinner',
      title: '吃晚饭',
      startTime: '18:30',
      endTime: '19:30',
      type: 'life',
      sceneType: 'meal',
      worldScene: AGENT_SCENE_BY_SCENE_TYPE.meal,
      detail: '晚上先好好吃饭。',
      iconKey: 'meal',
    }),
    createScheduleItem(dateKey, {
      key: 'home-evening',
      title: homeEveningType === 'watch' ? '看电影' : '打游戏',
      startTime: '20:00',
      endTime: '22:00',
      type: 'rest',
      sceneType: homeEveningType,
      worldScene: homeEveningScene,
      detail: homeEveningType === 'watch' ? '在客厅看一会儿电影。' : '在沙发边玩一会儿游戏。',
      iconKey: homeEveningType,
    }),
    createScheduleItem(dateKey, {
      key: 'late-home',
      title: '休息',
      startTime: '22:00',
      endTime: '24:00',
      type: 'rest',
      sceneType: 'idle',
      worldScene: AGENT_SCENE_BY_SCENE_TYPE.idle,
      detail: '晚上留在家里，节奏已经慢下来。',
      iconKey: 'moon',
    }),
  ];
}

function createScheduleItem(dateKey: string, input: ScheduleItemInput): CheScheduleItem {
  return {
    id: `che-${dateKey}-${input.key}`,
    dateKey,
    iconKey: input.iconKey,
    title: input.title,
    startTime: input.startTime,
    endTime: input.endTime,
    timeLabel: `${input.startTime}–${input.endTime}`,
    timePrecision: 'exact',
    type: input.type,
    source: 'che',
    sceneType: input.sceneType,
    worldScene: { ...input.worldScene },
    linkedPlanId: null,
    detail: input.detail,
  };
}

function parseScheduleDate(dateKey: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    throw new RangeError(`Invalid dateKey: ${dateKey}`);
  }
  const date = parseDateKey(dateKey);
  if (Number.isNaN(date.getTime()) || toDateKey(date) !== dateKey) {
    throw new RangeError(`Invalid dateKey: ${dateKey}`);
  }
  return date;
}

function getDateVariation(dateKey: string): number {
  return Array.from(dateKey).reduce((value, character) => (value * 31 + character.charCodeAt(0)) >>> 0, 0);
}
