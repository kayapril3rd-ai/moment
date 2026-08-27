import { useEffect, useState } from 'react';
import { defaultMemoryItems, defaultUserProfile, type UserProfile } from '../data/mockProfile';

const profileStorageKey = 'lumen.userProfile';
const memoryStorageKey = 'lumen.memoryItems';

export function useUserProfile() {
  const [userProfile, setUserProfileState] = useState<UserProfile>(() => readStoredProfile());
  const [memoryItems, setMemoryItemsState] = useState<string[]>(() => readStoredMemoryItems());

  useEffect(() => {
    window.localStorage.setItem(profileStorageKey, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    window.localStorage.setItem(memoryStorageKey, JSON.stringify(memoryItems));
  }, [memoryItems]);

  return {
    userProfile,
    memoryItems,
    setUserProfile: setUserProfileState,
    setMemoryItems: setMemoryItemsState,
  };
}

function readStoredProfile(): UserProfile {
  try {
    const stored = window.localStorage.getItem(profileStorageKey);
    if (!stored) return defaultUserProfile;
    const parsed = JSON.parse(stored) as Partial<UserProfile>;

    return {
      nickname: normalizeText(parsed.nickname, defaultUserProfile.nickname),
      preferences: {
        companionStyle: normalizeText(parsed.preferences?.companionStyle, defaultUserProfile.preferences.companionStyle),
        commonScenes: normalizeText(parsed.preferences?.commonScenes, defaultUserProfile.preferences.commonScenes),
        chatPace: normalizeText(parsed.preferences?.chatPace, defaultUserProfile.preferences.chatPace),
        dislikes: normalizeText(parsed.preferences?.dislikes, defaultUserProfile.preferences.dislikes),
      },
    };
  } catch {
    return defaultUserProfile;
  }
}

function readStoredMemoryItems(): string[] {
  try {
    const stored = window.localStorage.getItem(memoryStorageKey);
    if (!stored) return defaultMemoryItems;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return defaultMemoryItems;
    const normalized = parsed.map((item) => String(item).trim()).filter(Boolean);
    return normalized;
  } catch {
    return defaultMemoryItems;
  }
}

function normalizeText(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}
