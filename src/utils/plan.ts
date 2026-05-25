import type {
  CheScheduleItem,
  RecentMoment,
  SceneCard,
  SceneType,
  TimePrecision,
  UserPlan,
} from '../types/che';

export interface ParsedPlanInput {
  title: string;
  startTime: string;
  timeLabel: string;
  timePrecision: TimePrecision;
  sceneType: SceneType;
}

const clockTimePattern = /^(\d{1,2}:\d{2})\s+(.+)$/;
const clockTimeSearchPattern = /(\d{1,2}:\d{2})/;

export function parsePlanInput(input: string): ParsedPlanInput | null {
  const normalized = input.trim().replace(/\s+/g, ' ');

  if (!normalized) {
    return null;
  }

  const match = normalized.match(clockTimePattern);
  const title = match ? match[2].trim() : normalized;
  const timeLabel = match ? match[1] : inferLooseTimeLabel(normalized);

  return {
    title,
    startTime: match ? match[1] : '',
    timeLabel,
    timePrecision: match ? 'exact' : inferTimePrecision(timeLabel),
    sceneType: inferSceneTypeFromPlan(title),
  };
}

export function inferSceneTypeFromPlan(text: string): SceneType {
  if (/学习|工作|英语|复习|专注|写稿|看书|背单词/.test(text)) {
    return 'study';
  }

  if (/健身|运动|跑步|练背|瑜伽|训练|散步|公园/.test(text)) {
    return 'fitness';
  }

  if (/看剧|电影|动漫|综艺|追剧/.test(text)) {
    return 'watch';
  }

  if (/吃饭|晚饭|午饭|早餐|夜宵|做饭|热的/.test(text)) {
    return 'meal';
  }

  if (/睡觉|睡前|聊会儿|晚安/.test(text)) {
    return 'sleep';
  }

  return 'idle';
}

export function createUserPlanFromInput(input: string, now = new Date()): UserPlan | null {
  const parsed = parsePlanInput(input);

  if (!parsed) {
    return null;
  }

  const stamp = now.toISOString();
  const id = `plan-${now.getTime()}`;

  return {
    id,
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

export function getPlanTimeAnchor(plan: Pick<UserPlan, 'startTime' | 'timeLabel'>): string {
  const startTimeMatch = plan.startTime?.match(clockTimeSearchPattern);

  if (startTimeMatch) {
    return startTimeMatch[1];
  }

  const labelMatch = plan.timeLabel?.match(clockTimeSearchPattern);

  if (labelMatch) {
    return labelMatch[1];
  }

  const fallback = plan.timeLabel || plan.startTime || '时间待定';

  if (/睡前/.test(fallback)) return '睡前';
  if (/晚上|今晚|晚些/.test(fallback)) return '晚些时候';
  if (/下午/.test(fallback)) return '下午';
  if (/现在/.test(fallback)) return '现在';
  if (/待定/.test(fallback)) return '时间待定';

  return fallback.length > 5 ? '稍后' : fallback;
}

export function getPlanDurationLabel(plan: UserPlan): string {
  if (plan.endTime && plan.startTime) {
    return '一段时间';
  }

  switch (plan.sceneType) {
    case 'study':
      return '60 分钟';
    case 'fitness':
      return '45 分钟';
    case 'watch':
      return '90 分钟';
    case 'meal':
      return '40 分钟';
    default:
      return '30 分钟';
  }
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

  return {
    id: `scene-shared-${plan.id}`,
    sceneType: plan.sceneType,
    title: getSharedSceneTitle(plan),
    timeHint: timeLabel,
    timeLabel,
    timePrecision: plan.timePrecision ?? inferTimePrecision(timeLabel),
    description: getSharedSceneDescription(plan),
    status: 'scheduled',
    linkedPlanId: plan.id,
    conversationMode: 'scene',
    sortOrder,
  };
}

export function createCheScheduleItemFromPlan(plan: UserPlan): CheScheduleItem {
  const timeLabel = getDisplayTimeLabel(plan);

  return {
    id: `che-shared-${plan.id}`,
    title: getCheScheduleTitle(plan),
    startTime: plan.startTime,
    endTime: null,
    timeLabel,
    timePrecision: plan.timePrecision ?? inferTimePrecision(timeLabel),
    type: 'shared',
    source: 'user_invite',
    sceneType: plan.sceneType,
    linkedPlanId: plan.id,
    detail: getCheScheduleDetail(plan),
  };
}

export function createRecentMomentFromPlan(plan: UserPlan, now = new Date()): RecentMoment {
  return {
    id: `moment-shared-${plan.id}`,
    time: '刚刚',
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

function getSharedSceneTitle(plan: UserPlan): string {
  switch (plan.sceneType) {
    case 'study':
      return '一起学习';
    case 'fitness':
      return '一起健身';
    case 'watch':
      return '一起看电影';
    case 'meal':
      return '一起吃饭';
    case 'sleep':
      return '睡前聊会儿';
    default:
      return `一起${plan.title}`;
  }
}

function getSharedSceneDescription(plan: UserPlan): string {
  switch (plan.sceneType) {
    case 'study':
      return `你要${plan.title}，澈那会儿也会在书桌旁。`;
    case 'fitness':
      return '这是你刚刚邀请澈一起做的事。';
    case 'watch':
      return '今晚可以轻一点，一起慢慢看一部。';
    case 'meal':
      return '到点先吃点热的，他也会留意自己的晚饭。';
    case 'sleep':
      return '睡前留一点安静时间，不急着把话说满。';
    default:
      return '你们刚刚把这段时间约好了。';
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
