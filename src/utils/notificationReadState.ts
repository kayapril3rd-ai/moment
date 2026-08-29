import type { CheNotification } from '../types/che';

const NOTIFICATION_READ_STORAGE_KEY = 'moment.notifications.read';
const MAX_STORED_READ_KEYS = 200;

export function getNotificationReadKey(notification: CheNotification): string {
  const value = `${notification.dateKey}|${notification.id}|${notification.content}`;
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${notification.dateKey}:${notification.id}:${(hash >>> 0).toString(36)}`;
}

export function readNotificationReadKeys(storage: Storage = window.localStorage): Set<string> {
  try {
    const stored = storage.getItem(NOTIFICATION_READ_STORAGE_KEY);
    if (!stored) return new Set();
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== 'string')) return new Set();
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

export function markNotificationsRead(
  notifications: CheNotification[],
  storage: Storage = window.localStorage,
): Set<string> {
  const readKeys = readNotificationReadKeys(storage);
  notifications.forEach((notification) => readKeys.add(getNotificationReadKey(notification)));
  const boundedKeys = [...readKeys].slice(-MAX_STORED_READ_KEYS);
  try {
    storage.setItem(NOTIFICATION_READ_STORAGE_KEY, JSON.stringify(boundedKeys));
  } catch {
    // The in-memory state still clears the badge when storage is unavailable.
  }
  return new Set(boundedKeys);
}

export function getNotificationReadStorageKey(): string {
  return NOTIFICATION_READ_STORAGE_KEY;
}
