export interface UserProfilePreferences {
  companionStyle: string;
  commonScenes: string;
  chatPace: string;
  dislikes: string;
}

export interface UserProfile {
  nickname: string;
  preferences: UserProfilePreferences;
}

export const defaultUserProfile: UserProfile = {
  nickname: '小琪',
  preferences: {
    companionStyle: '轻声陪着、具体回应',
    commonScenes: '饮食、运动、Deep Room',
    chatPace: '慢一点、不要催促',
    dislikes: '太爹味、太油腻、空泛安慰',
  },
};

export const relationshipStats = {
  companionDays: 28,
  deepChatCount: 16,
  completedTogetherCount: 12,
  recentCompanion: '一起健身',
  recentDeepChat: '夜里',
};

export const defaultMemoryItems: string[] = [];

export const privacyActions = [
  '清除聊天记录',
  '清除活动记录',
  '导出我的数据',
];
