export type SceneType =
  | 'study'
  | 'watch'
  | 'fitness'
  | 'meal'
  | 'gaming'
  | 'sleep'
  | 'commute'
  | 'idle'
  | 'deep_room';

export type ConversationMode = 'scene' | 'deep';

export type InviteStatus = 'not_invited' | 'invited' | 'accepted';

export type UserPlanStatus = 'todo' | 'accepted' | 'active' | 'done' | 'cancelled';

export type ScheduleItemType = 'work' | 'life' | 'shared' | 'rest';

export type ScheduleItemSource = 'che' | 'user_invite' | 'mock';

export type SceneCardStatus =
  | 'availableNow'
  | 'scheduled'
  | 'flexible'
  | 'active'
  | 'completed'
  | 'deep'
  | 'available'
  | 'planned'
  | 'shared'
  | 'disabled';

export type TimePrecision = 'exact' | 'approximate' | 'period' | 'open';

export interface CheStatus {
  id: string;
  period: string;
  currentActivity: string;
  moodHint: string;
  location: string;
  detail: string;
  outfit: string;
  availableScenes: SceneType[];
  updatedAt: string;
}

export interface UserPlan {
  id: string;
  dateKey?: string;
  sceneKey?: string;
  title: string;
  startTime: string;
  endTime: string | null;
  timeLabel?: string;
  timePrecision?: TimePrecision;
  durationMinutes?: number;
  sceneType: SceneType;
  note: string;
  inviteStatus: InviteStatus;
  status?: UserPlanStatus;
  inviteReply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheScheduleItem {
  id: string;
  dateKey?: string;
  sceneKey?: string;
  iconKey?: string;
  actionLabel?: string;
  status?: string;
  cardImage?: string;
  heroImage?: string;
  cardFocus?: string;
  heroFocus?: string;
  title: string;
  startTime: string;
  endTime: string | null;
  timeLabel?: string;
  timePrecision?: TimePrecision;
  type: ScheduleItemType;
  source: ScheduleItemSource;
  sceneType: SceneType | null;
  linkedPlanId: string | null;
  detail: string;
}

export interface SceneCard {
  id: string;
  sceneType: SceneType;
  title: string;
  timeHint: string;
  timeLabel?: string;
  timePrecision?: TimePrecision;
  description: string;
  status: SceneCardStatus;
  linkedPlanId: string | null;
  conversationMode: ConversationMode;
  sortOrder: number;
}

export interface RecentMoment {
  id: string;
  time: string;
  text: string;
  sourceScene: SceneType | null;
  linkedPlanId: string | null;
  createdAt: string;
}

export type DayRecordKind = 'activity' | 'letter';
export type DayRecordOwner = 'mine' | 'che';

export interface DayRecord {
  id: string;
  dateKey?: string;
  date?: string;
  owner?: DayRecordOwner;
  kind: DayRecordKind;
  title: string;
  timeLabel: string;
  summary: string;
  detail?: string;
  sceneType: SceneType | null;
  linkedPlanId: string | null;
  status?: 'active' | 'completed';
  startedAt?: string;
  endedAt?: string;
}

export interface RelationshipState {
  familiarity: number;
  dailyBond: number;
  trust: number;
  mutuality: number;
  tension: number;
  lastUpdatedAt: string;
}

export interface SceneData {
  id: SceneType;
  title: string;
  shortTitle: string;
  conversationMode: ConversationMode;
  entryLabel: string;
  setting: string;
  cheStatusHint: string;
  starterMessage: string;
  allowedQuickReplies: string[];
  isDeepEntry: boolean;
  imageUrl?: string;
  mood?: 'mist' | 'warm' | 'night' | 'green' | 'coastal';
  textTone?: 'light' | 'dark';
  focalPoint?: string;
}

export interface ChatMessage {
  id: string;
  role: 'che' | 'user';
  text: string;
  createdAt: string;
}

export interface TodayCopy {
  appName: string;
  headerTitle: string;
  currentTimeLabel: string;
  heroEyebrow: string;
  heroActionLabel: string;
  overviewTitle: string;
  userOverviewTitle: string;
  cheOverviewTitle: string;
  sharedOverlapLabel: string;
  sceneSectionTitle: string;
  momentsSectionTitle: string;
  momentsArchiveLabel: string;
  scheduleBarTitle: string;
  scheduleBarSubtitle: string;
}
