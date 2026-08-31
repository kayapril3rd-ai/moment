import { sceneRegistry } from '../data/mockScenes';
import type { DayRecord, RecentMoment, SceneType, UserPlan } from '../types/che';

const USER_PLANS_STORAGE_KEY = 'moment.userPlans';
const DAY_RECORDS_STORAGE_KEY = 'moment.dayRecords';
const RECENT_MOMENTS_STORAGE_KEY = 'moment.recentMoments';

type DayStateStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function readUserPlans(storage: DayStateStorage = window.localStorage): UserPlan[] {
  return readStoredArray(storage, USER_PLANS_STORAGE_KEY, isUserPlan);
}

export function writeUserPlans(plans: UserPlan[], storage: DayStateStorage = window.localStorage): void {
  writeStoredArray(storage, USER_PLANS_STORAGE_KEY, plans);
}

export function readDayRecords(storage: DayStateStorage = window.localStorage): DayRecord[] {
  return readStoredArray(storage, DAY_RECORDS_STORAGE_KEY, isDayRecord)
    .map((record) => record.kind === 'letter' ? { ...record, owner: 'mine' } : record);
}

export function writeDayRecords(records: DayRecord[], storage: DayStateStorage = window.localStorage): void {
  writeStoredArray(storage, DAY_RECORDS_STORAGE_KEY, records);
}

export function readRecentMoments(storage: DayStateStorage = window.localStorage): RecentMoment[] {
  return readStoredArray(storage, RECENT_MOMENTS_STORAGE_KEY, isRecentMoment);
}

export function writeRecentMoments(moments: RecentMoment[], storage: DayStateStorage = window.localStorage): void {
  writeStoredArray(storage, RECENT_MOMENTS_STORAGE_KEY, moments);
}

export function getDayStateStorageKeys() {
  return {
    userPlans: USER_PLANS_STORAGE_KEY,
    dayRecords: DAY_RECORDS_STORAGE_KEY,
    recentMoments: RECENT_MOMENTS_STORAGE_KEY,
  } as const;
}

function readStoredArray<T>(storage: DayStateStorage, key: string, guard: (value: unknown) => value is T): T[] {
  try {
    const parsed = JSON.parse(storage.getItem(key) ?? '[]') as unknown;
    return Array.isArray(parsed) && parsed.every(guard) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredArray<T>(storage: DayStateStorage, key: string, items: T[]): void {
  try {
    storage.setItem(key, JSON.stringify(items));
  } catch {
    // Runtime state remains usable when local storage is unavailable.
  }
}

function isUserPlan(value: unknown): value is UserPlan {
  if (!isObject(value)) return false;
  return typeof value.id === 'string'
    && (value.dateKey === undefined || typeof value.dateKey === 'string')
    && typeof value.title === 'string'
    && typeof value.startTime === 'string'
    && (value.endTime === null || typeof value.endTime === 'string')
    && isSceneType(value.sceneType)
    && isObject(value.worldScene)
    && typeof value.worldScene.sceneKey === 'string'
    && typeof value.worldScene.sceneVariant === 'string'
    && typeof value.note === 'string'
    && (value.inviteStatus === 'not_invited' || value.inviteStatus === 'accepted')
    && ['todo', 'active', 'done', 'cancelled'].includes(String(value.status))
    && typeof value.createdAt === 'string'
    && typeof value.updatedAt === 'string';
}

function isDayRecord(value: unknown): value is DayRecord {
  if (!isObject(value)) return false;
  return typeof value.id === 'string'
    && typeof value.dateKey === 'string'
    && (value.owner === undefined || value.owner === 'mine' || value.owner === 'che')
    && (value.kind === 'activity' || value.kind === 'letter')
    && typeof value.title === 'string'
    && typeof value.timeLabel === 'string'
    && typeof value.summary === 'string'
    && (value.detail === undefined || typeof value.detail === 'string')
    && (value.sceneType === null || isSceneType(value.sceneType))
    && (value.linkedPlanId === null || typeof value.linkedPlanId === 'string');
}

function isRecentMoment(value: unknown): value is RecentMoment {
  if (!isObject(value)) return false;
  return typeof value.id === 'string'
    && typeof value.text === 'string'
    && (value.sourceScene === null || isSceneType(value.sourceScene))
    && (value.linkedPlanId === null || typeof value.linkedPlanId === 'string')
    && typeof value.createdAt === 'string';
}

function isSceneType(value: unknown): value is SceneType {
  return typeof value === 'string' && value in sceneRegistry;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
