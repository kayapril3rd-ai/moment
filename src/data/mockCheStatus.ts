import type { CheStatus, TodayCopy } from '../types/che';

export const todayCopy: TodayCopy = {
  appName: '此刻',
  headerTitle: '今天',
  currentTimeLabel: '当前时间',
  heroEyebrow: '他现在',
  heroActionLabel: '去找他',
  overviewTitle: '你和澈今天',
  userOverviewTitle: '我的计划',
  cheOverviewTitle: '澈的状态',
  sharedOverlapLabel: '今晚交汇',
  sceneSectionTitle: '今天可以一起',
  momentsSectionTitle: '最近的小片段',
  momentsArchiveLabel: '更多 >',
  scheduleBarTitle: '今日安排',
  scheduleBarSubtitle: '晚点的安排在这里',
};

export const mockCheStatus: CheStatus = {
  id: 'che-status-today',
  period: '下午',
  currentActivity: '整理一篇体验评审稿',
  moodHint: '有点专注，但不算忙到失联',
  location: '窗边',
  detail: '咖啡还剩半杯，\n窗边的路灯开了。\n需要我帮你收尾一下吗？',
  outfit: '浅灰针织衫，头发刚吹干',
  availableScenes: ['study', 'watch', 'meal', 'fitness'],
  updatedAt: '2026-05-26T14:20:00+08:00',
};

export const userTodaySummary = {
  title: '1 待做 · 1 已约',
  detail: '下个：吃点热的',
};

export const cheTodaySummary = {
  title: '下午收尾项目',
  detail: '20:30 后会空一点',
};
