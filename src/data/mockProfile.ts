export interface UserProfilePreferences {
  companionStyle: string;
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
    companionStyle: '具体一点、自然接话',
    chatPace: '慢一点、少催促',
    dislikes: '太油腻、说教、空泛安慰',
  },
};

export const defaultMemoryItems: string[] = [];

export const privacyActions = [
  '清除聊天记录',
  '清除活动记录',
  '导出我的数据',
];
