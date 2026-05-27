import type { CheScheduleItem, DayRecord, RecentMoment, SceneCard, SceneType, TimePrecision } from '../types/che';
import { toDateKey } from './date';

export function syncCheScheduleForActive(schedule: CheScheduleItem[], card: SceneCard, startedAt: string): CheScheduleItem[] {
  const activeItem: CheScheduleItem = {
    id: `che-active-${card.id}`,
    title: `正在陪你${card.title.replace('一起', '')}`,
    startTime: new Date(startedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
    endTime: null,
    timeLabel: '现在',
    timePrecision: 'open',
    type: 'shared',
    source: 'mock',
    sceneType: card.sceneType,
    linkedPlanId: card.linkedPlanId,
    detail: getActiveCheScheduleDetail(card.sceneType),
  };

  if (card.linkedPlanId && schedule.some((item) => item.linkedPlanId === card.linkedPlanId)) {
    return schedule.map((item) => (item.linkedPlanId === card.linkedPlanId ? activeItem : item));
  }

  return [activeItem, ...schedule.filter((item) => item.id !== activeItem.id)];
}

export function createActivityRecord(card: SceneCard, startedAt: string | null, completedAt: string): DayRecord {
  return {
    id: `record-${card.id}`,
    date: toDateKey(new Date(completedAt)),
    owner: 'mine',
    kind: 'activity',
    title: card.title,
    timeLabel: `${card.timeHint} · 已完成`,
    summary: getCompletedRecordSummary(card.sceneType),
    detail: getCompletedRecordDetail(card.sceneType),
    sceneType: card.sceneType,
    linkedPlanId: card.linkedPlanId,
    status: 'completed',
    startedAt: startedAt ? formatTime(startedAt) : card.timeHint,
    endedAt: formatTime(completedAt),
  };
}

export function getActiveCardDescription(sceneType: SceneType): string {
  switch (sceneType) {
    case 'fitness':
      return '已经开始了。先热身，别一下子太狠。';
    case 'watch':
      return '你们已经坐下来了，今晚就轻一点。';
    case 'meal':
      return '正在吃点热的，先不用急着说太多。';
    case 'study':
      return '这段时间留给专注，澈也在书桌边。';
    default:
      return '这件事正在发生，澈在你身边。';
  }
}

export function getActiveMomentText(card: SceneCard): string {
  if (card.sceneType === 'fitness') return '你们提前开始了晚点的健身。';
  if (card.sceneType === 'watch') return '你们现在开始一起看电影。';
  return `你们开始了${card.title}。`;
}

export function getTimePrecisionFromLabel(timeLabel: string): TimePrecision {
  if (/^\d{1,2}:\d{2}$/.test(timeLabel)) return 'exact';
  if (/左右|大概/.test(timeLabel)) return 'approximate';
  if (/现在|稍后|时间待定/.test(timeLabel)) return 'open';
  return 'period';
}

export function extractStartTime(timeLabel: string): string {
  return timeLabel.match(/\d{1,2}:\d{2}/)?.[0] ?? '';
}

export function addUniqueMoment(currentMoments: RecentMoment[], moment: RecentMoment): RecentMoment[] {
  if (currentMoments.some((item) => item.id === moment.id)) return currentMoments;
  return [moment, ...currentMoments];
}

export function addUniqueRecord(currentRecords: DayRecord[], record: DayRecord): DayRecord[] {
  if (currentRecords.some((item) => item.id === record.id)) {
    return currentRecords.map((item) => (item.id === record.id ? record : item));
  }

  return [record, ...currentRecords];
}

export function createMoment({
  id,
  text,
  sourceScene,
  linkedPlanId,
}: {
  id: string;
  text: string;
  sourceScene: SceneType | null;
  linkedPlanId: string | null;
}): RecentMoment {
  return { id, time: '刚刚', text, sourceScene, linkedPlanId, createdAt: new Date().toISOString() };
}

function getActiveCheScheduleDetail(sceneType: SceneType): string {
  switch (sceneType) {
    case 'fitness':
      return '他在陪你开始训练，提醒你先稳一点。';
    case 'watch':
      return '他倒了杯水，坐回沙发边陪你慢慢看。';
    case 'meal':
      return '他把这段时间留给了好好吃饭。';
    default:
      return '他把这段时间留给你们一起做这件事。';
  }
}

function getCompletedRecordSummary(sceneType: SceneType): string {
  if (sceneType === 'fitness') return '你们练了背，澈提醒你今天不要一下子练太狠。';
  if (sceneType === 'watch') return '你们慢慢看完了一部，没有把今天绷得太紧。';
  return '这段一起做的事被收进今天。';
}

function getCompletedRecordDetail(sceneType: SceneType): string {
  if (sceneType === 'fitness') return '开始前他让你先活动肩背，后面也没有催你加重量。';
  if (sceneType === 'watch') return '剧情没必要一次看完，轻一点也算把晚上过稳。';
  return '这是一段轻的共同记录。';
}

function formatTime(isoTime: string): string {
  return new Date(isoTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}
