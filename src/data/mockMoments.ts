import type { RecentMoment, RelationshipState } from '../types/che';

export const mockRecentMoments: RecentMoment[] = [
  {
    id: 'moment-001',
    time: '刚刚',
    text: '澈把晚上的训练时间往后挪了十分钟，跟上你的计划。',
    sourceScene: 'fitness',
    linkedPlanId: 'plan-002',
    createdAt: '2026-05-20T12:49:00+08:00',
  },
  {
    id: 'moment-002',
    time: '昨晚',
    text: '你们一起看完一集剧，他记得你说片尾曲很好听。',
    sourceScene: 'watch',
    linkedPlanId: null,
    createdAt: '2026-05-19T23:18:00+08:00',
  },
  {
    id: 'moment-003',
    time: '今天上午',
    text: '他提到下午有项目收尾，可能回复会慢一点。',
    sourceScene: null,
    linkedPlanId: null,
    createdAt: '2026-05-20T10:20:00+08:00',
  },
];

export const mockRelationshipState: RelationshipState = {
  familiarity: 18,
  dailyBond: 12,
  trust: 6,
  mutuality: 10,
  tension: 3,
  lastUpdatedAt: '2026-05-20T12:49:00+08:00',
};
