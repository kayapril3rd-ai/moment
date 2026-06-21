import type { UserProfile } from '../data/mockProfile';

export interface AgentRelationshipStats {
  companionDays: number;
  deepChatCount: number;
  completedTogetherCount: number;
  recentCompanion?: string;
  recentDeepChat?: string;
}

export function buildUserContextForAgent(
  userProfile: UserProfile,
  memoryItems: string[],
  relationshipStats: AgentRelationshipStats,
) {
  return {
    nickname: userProfile.nickname,
    preferences: userProfile.preferences,
    memories: memoryItems,
    relationshipStats,
  };
}
