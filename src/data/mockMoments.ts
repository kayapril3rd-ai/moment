import type { RecentMoment } from '../types/che';

export const mockRecentMoments: RecentMoment[] = [
  {
    id: 'moment-001',
    text: '澈把晚上的训练时间往后挪了十分钟，跟上你的计划。',
    sourceScene: 'fitness',
    linkedPlanId: 'workout',
    createdAt: '2026-05-26T12:49:00+08:00',
  },
  {
    id: 'moment-002',
    text: '你们一起看完一集剧，他记得你说片尾曲很好听。',
    sourceScene: 'watch',
    linkedPlanId: null,
    createdAt: '2026-05-25T23:18:00+08:00',
  },
  {
    id: 'moment-003',
    text: '他提到下午有项目收尾，可能回复会慢一点。',
    sourceScene: null,
    linkedPlanId: null,
    createdAt: '2026-05-26T10:20:00+08:00',
  },
];
