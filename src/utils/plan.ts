import type {
  CheScheduleItem,
  RecentMoment,
  SceneCard,
  SceneType,
  TimePrecision,
  UserPlan,
} from '../types/che';
import { toDateKey } from './date';

export interface ParsedPlanInput {
  dateKey: string;
  title: string;
  startTime: string;
  timeLabel: string;
  timePrecision: TimePrecision;
  sceneType: SceneType;
}

type SceneCategory = 'work' | 'fitness' | 'meal' | 'walk' | 'rest' | 'default';

const clockTimeSearchPattern = /(\d{1,2}:\d{2})/;
const cnNumber = '(?:一|二|两|三|四|五|六|七|八|九|十|十一|十二)';
const periodWords = '(?:上午|中午|下午|晚上|夜里|晚些时候)';
const timeWordPattern = new RegExp(`\\d{1,2}:\\d{2}|${periodWords}?\\s*(?:${cnNumber}|\\d{1,2})(?:点半|点)|${periodWords}`);

export function parsePlanInput(input: string, now = new Date(), selectedDateKey = toDateKey(now)): ParsedPlanInput | null {
  const normalized = input.trim().replace(/\s+/g, ' ');

  if (!normalized) return null;

  const { dateKey, textWithoutDate } = extractDateKey(normalized, now, selectedDateKey);
  const timeMatch = textWithoutDate.match(timeWordPattern);
  const timeLabel = timeMatch ? timeMatch[0].replace(/\s+/g, '') : inferLooseTimeLabel(textWithoutDate);
  const title = (timeMatch ? textWithoutDate.replace(timeMatch[0], '') : textWithoutDate).trim() || normalized;
  const startTime = /^\d{1,2}:\d{2}$/.test(timeLabel) ? timeLabel : '';

  return {
    dateKey,
    title,
    startTime,
    timeLabel,
    timePrecision: inferTimePrecision(timeLabel),
    sceneType: inferSceneTypeFromPlan(title),
  };
}

export function inferSceneTypeFromPlan(text: string): SceneType {
  return sceneCategoryToSceneType(inferSceneCategory(text));
}

export function createUserPlanFromInput(input: string, now = new Date(), selectedDateKey?: string): UserPlan | null {
  const parsed = parsePlanInput(input, now, selectedDateKey ?? toDateKey(now));
  if (!parsed) return null;

  const stamp = now.toISOString();
  return {
    id: `plan-${now.getTime()}`,
    dateKey: parsed.dateKey,
    title: parsed.title,
    startTime: parsed.startTime,
    endTime: null,
    timeLabel: parsed.timeLabel,
    timePrecision: parsed.timePrecision,
    sceneType: parsed.sceneType,
    note: getDefaultPlanNote(parsed.sceneType),
    inviteStatus: 'not_invited',
    status: 'todo',
    createdAt: stamp,
    updatedAt: stamp,
  };
}

function extractDateKey(input: string, now: Date, selectedDateKey: string) {
  const dateMatch = input.match(/今天|明天|后天/);
  if (!dateMatch) return { dateKey: selectedDateKey, textWithoutDate: input };

  const offsetMap: Record<string, number> = { 今天: 0, 明天: 1, 后天: 2 };
  const date = new Date(now);
  date.setDate(date.getDate() + offsetMap[dateMatch[0]]);
  return {
    dateKey: toDateKey(date),
    textWithoutDate: input.replace(dateMatch[0], '').trim(),
  };
}

export function getPlanTimeAnchor(plan: Pick<UserPlan, 'startTime' | 'timeLabel'>): string {
  const startTimeMatch = plan.startTime?.match(clockTimeSearchPattern);
  if (startTimeMatch) return startTimeMatch[1];

  const labelMatch = plan.timeLabel?.match(clockTimeSearchPattern);
  if (labelMatch) return labelMatch[1];

  const fallback = plan.timeLabel || plan.startTime || '时间待定';
  if (/睡前/.test(fallback)) return '睡前';
  if (/晚上|今晚|晚些/.test(fallback)) return '晚些时候';
  if (/下午/.test(fallback)) return '下午';
  if (/现在/.test(fallback)) return '现在';
  if (/待定/.test(fallback)) return '时间待定';
  return fallback.length > 5 ? '稍后' : fallback;
}

export function getCheInviteReply(plan: UserPlan): string {
  switch (plan.sceneType) {
    case 'study':
      return '可以。我那会儿也适合安静待着，你开始的时候叫我一声。';
    case 'fitness':
      return '好，我把那段空出来。你热身的时候我也准备一下。';
    case 'watch':
      return '嗯，今晚可以轻一点。你开的时候喊我，我去倒杯水。';
    case 'meal':
      return '好，别太随便糊弄。我这边也差不多到饭点。';
    case 'sleep':
      return '可以。睡前慢一点说，不用把话都赶完。';
    default:
      return '可以。我看一下那会儿的空档，先给你留着。';
  }
}

export function createSharedSceneFromPlan(plan: UserPlan, sortOrder = 0): SceneCard {
  const timeLabel = getDisplayTimeLabel(plan);
  const sceneType = plan.sceneType;
  return {
    id: `scene-shared-${plan.id}`,
    sceneType,
    title: getSharedSceneTitle(plan),
    timeHint: timeLabel,
    timeLabel,
    timePrecision: plan.timePrecision ?? inferTimePrecision(timeLabel),
    description: getSharedSceneDescription(plan),
    status: 'scheduled',
    linkedPlanId: plan.id,
    sortOrder,
  };
}

export function createCheScheduleItemFromPlan(plan: UserPlan): CheScheduleItem {
  const timeLabel = getDisplayTimeLabel(plan);
  const sceneType = plan.sceneType;
  return {
    id: `che-shared-${plan.id}`,
    title: getCheScheduleTitle(plan),
    startTime: plan.startTime,
    endTime: null,
    timeLabel,
    timePrecision: plan.timePrecision ?? inferTimePrecision(timeLabel),
    type: 'shared',
    source: 'user_invite',
    sceneType,
    linkedPlanId: plan.id,
    detail: getCheScheduleDetail(plan),
  };
}

export function createRecentMomentFromPlan(plan: UserPlan, now = new Date()): RecentMoment {
  return {
    id: `moment-shared-${plan.id}`,
    text: getRecentMomentText(plan),
    sourceScene: plan.sceneType,
    linkedPlanId: plan.id,
    createdAt: now.toISOString(),
  };
}

function getDisplayTimeLabel(plan: UserPlan): string {
  return plan.timeLabel || plan.startTime || '时间待定';
}

function inferLooseTimeLabel(input: string): string {
  if (/睡前|晚安/.test(input)) return '睡前';
  if (/晚上|今晚|电影|看剧/.test(input)) return '晚些时候';
  if (/下午/.test(input)) return '下午';
  if (/散步|整理|房间/.test(input)) return '时间待定';
  return '时间待定';
}

function inferTimePrecision(timeLabel: string): TimePrecision {
  if (/^\d{1,2}:\d{2}$/.test(timeLabel)) return 'exact';
  if (/左右|大概/.test(timeLabel)) return 'approximate';
  if (/现在|稍后|时间待定/.test(timeLabel)) return 'open';
  return 'period';
}

function getDefaultPlanNote(sceneType: SceneType): string {
  switch (sceneType) {
    case 'study':
      return '一起进入专注模式。';
    case 'fitness':
      return '运动让心情更轻盈。';
    case 'watch':
      return '选一部喜欢的电影吧。';
    case 'meal':
      return '先吃点热的，不要随便糊弄。';
    case 'sleep':
      return '睡前慢一点，留一小段安静时间。';
    default:
      return '把这件小事放进今天。';
  }
}

function inferSceneCategory(text: string): SceneCategory {
  if (/学习|工作|写稿|面试|复习|看书|整理|做项目|开会|专注|设计|代码|英语|背单词/.test(text)) return 'work';
  if (/健身|运动|练背|瑜伽|跑步|拉伸|训练/.test(text)) return 'fitness';
  if (/吃饭|晚饭|午饭|早餐|做饭|咖啡|喝水|休息|夜宵|热的/.test(text)) return 'meal';
  if (/散步|出门|晒太阳|公园|走走|透气|放松/.test(text)) return 'walk';
  if (/电影|音乐|追剧|看剧|睡前|夜里|聊天|晚安/.test(text)) return 'rest';
  return 'default';
}

function sceneCategoryToSceneType(category: SceneCategory): SceneType {
  switch (category) {
    case 'work':
      return 'study';
    case 'fitness':
      return 'fitness';
    case 'meal':
      return 'meal';
    case 'rest':
      return 'watch';
    case 'walk':
    case 'default':
      return 'idle';
  }
}

function getSharedSceneTitle(plan: UserPlan): string {
  switch (plan.sceneType) {
    case 'study':
      return '一起工作';
    case 'fitness':
      return '一起健身';
    case 'watch':
      return '一起看电影';
    case 'meal':
      return '一起吃饭';
    case 'sleep':
      return '睡前聊会儿';
    default:
      return '随便待一会儿';
  }
}

function getSharedSceneDescription(plan: UserPlan): string {
  switch (plan.sceneType) {
    case 'study':
      return '他也在安静处理事情。';
    case 'fitness':
      return '他刚换好运动鞋。';
    case 'watch':
      return '他把声音放轻了一点。';
    case 'meal':
      return '他在等你把饭收好。';
    case 'sleep':
    case 'deep_room':
      return '他把声音放轻了一点。';
    default:
      return '他在这里，等你说话。';
  }
}

function getCheScheduleTitle(plan: UserPlan): string {
  switch (plan.sceneType) {
    case 'study':
      return `陪你${plan.title}`;
    case 'fitness':
      return `和你一起${plan.title}`;
    case 'watch':
      return '一起看电影';
    case 'meal':
      return '和你一起吃点热的';
    case 'sleep':
      return '睡前陪你聊会儿';
    default:
      return `陪你${plan.title}`;
  }
}

function getCheScheduleDetail(plan: UserPlan): string {
  switch (plan.sceneType) {
    case 'study':
      return '书桌边，适合安静待一会儿。';
    case 'fitness':
      return '运动前先热身，不赶进度。';
    case 'watch':
      return '客厅，灯开低一点。';
    case 'meal':
      return '餐桌旁，先把饭吃安稳。';
    case 'sleep':
      return '睡前半小时，声音放轻。';
    default:
      return '他把这段时间先留出来。';
  }
}

function getRecentMomentText(plan: UserPlan): string {
  switch (plan.sceneType) {
    case 'study':
      return `你们约好了${getDisplayTimeLabel(plan)}一起${plan.title}。`;
    case 'fitness':
      return `你们约好了今天一起${plan.title}。`;
    case 'watch':
      return '澈把晚上的时间留给了一小段陪你看电影。';
    case 'meal':
      return '你们把吃饭这件小事认真放进了今天。';
    case 'sleep':
      return '你们给睡前留了一小段安静的时间。';
    default:
      return `你们约好了${getDisplayTimeLabel(plan)}一起${plan.title}。`;
  }
}
