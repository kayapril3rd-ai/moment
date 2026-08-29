import type { ChatRequest, ChatResponse, ChatUserContext } from '../src/types/chat.ts';

const MAX_MEMORY_ITEMS = 20;
const MAX_MEMORY_ITEM_LENGTH = 300;

const CHAT_MODES = new Set(['scene', 'deep']);
const AGENT_SCENE_KEYS = new Set([
  'home_idle',
  'focus',
  'meal',
  'fitness',
  'errand',
  'commute',
  'hangout',
  'deep_room',
]);
const SCENE_VARIANTS = new Set([
  'work_desk',
  'sofa_evening',
  'cooking',
  'home_gym',
  'city_evening',
  'window_night',
  'movie_night',
  'gaming_sofa',
  'bedside_night',
  'home_day',
  'grocery',
  'park',
  'seaside',
]);

export interface DifyBlockingRequest {
  inputs: {
    chatMode: string;
    sceneKey: string;
    sceneVariant: string;
    cheCurrentState: string;
    nickname: string;
    companionStyle: string;
    chatPace: string;
    dislikes: string;
    memoryContext: string;
  };
  query: string;
  response_mode: 'blocking';
  conversation_id: string;
  user: string;
  files: [];
}

export function parseMomentChatRequest(value: unknown): ChatRequest | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const request = value as Partial<ChatRequest>;
  const context = request.context;
  const userContext = normalizeChatUserContext(request.userContext);

  if (
    typeof request.query !== 'string'
    || request.query.trim().length === 0
    || typeof request.userId !== 'string'
    || request.userId.trim().length === 0
    || !request.userId.trim().startsWith('moment-anon-')
    || (request.conversationId !== undefined && typeof request.conversationId !== 'string')
    || !context
    || !CHAT_MODES.has(context.chatMode)
    || typeof context.sceneKey !== 'string'
    || !AGENT_SCENE_KEYS.has(context.sceneKey)
    || typeof context.sceneVariant !== 'string'
    || !SCENE_VARIANTS.has(context.sceneVariant)
    || typeof context.cheCurrentState !== 'string'
    || context.cheCurrentState.trim().length === 0
    || !userContext
  ) {
    return null;
  }

  return {
    query: request.query.trim(),
    context,
    userContext,
    conversationId: request.conversationId?.trim() || undefined,
    userId: request.userId.trim(),
  };
}

export function buildDifyBlockingRequest(request: ChatRequest): DifyBlockingRequest {
  return {
    inputs: {
      chatMode: request.context.chatMode,
      sceneKey: request.context.sceneKey,
      sceneVariant: request.context.sceneVariant,
      cheCurrentState: request.context.cheCurrentState,
      nickname: request.userContext.nickname,
      companionStyle: request.userContext.companionStyle,
      chatPace: request.userContext.chatPace,
      dislikes: request.userContext.dislikes,
      memoryContext: formatMemoryContext(request.userContext.memoryItems),
    },
    query: request.query,
    response_mode: 'blocking',
    conversation_id: request.conversationId ?? '',
    user: request.userId,
    files: [],
  };
}

export function normalizeChatUserContext(value: unknown): ChatUserContext | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const context = value as Partial<ChatUserContext>;
  if (
    typeof context.nickname !== 'string'
    || context.nickname.trim().length === 0
    || typeof context.companionStyle !== 'string'
    || typeof context.chatPace !== 'string'
    || typeof context.dislikes !== 'string'
    || !Array.isArray(context.memoryItems)
    || context.memoryItems.some((item) => typeof item !== 'string')
  ) {
    return null;
  }

  return {
    nickname: context.nickname.trim(),
    companionStyle: context.companionStyle.trim(),
    chatPace: context.chatPace.trim(),
    dislikes: context.dislikes.trim(),
    memoryItems: context.memoryItems
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, MAX_MEMORY_ITEMS)
      .map((item) => item.slice(0, MAX_MEMORY_ITEM_LENGTH)),
  };
}

export function formatMemoryContext(memoryItems: string[]): string {
  if (memoryItems.length === 0) return '暂无明确记忆。';
  return `我明确记得的用户事实：\n\n${memoryItems.map((item) => `- ${item}`).join('\n')}`;
}

export function parseDifyBlockingResponse(value: unknown): ChatResponse | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const response = value as Record<string, unknown>;
  const messageId = typeof response.message_id === 'string'
    ? response.message_id
    : typeof response.id === 'string'
      ? response.id
      : null;

  if (
    typeof response.answer !== 'string'
    || response.answer.trim().length === 0
    || typeof response.conversation_id !== 'string'
    || response.conversation_id.trim().length === 0
    || !messageId
    || messageId.trim().length === 0
  ) {
    return null;
  }

  return {
    answer: response.answer,
    conversationId: response.conversation_id,
    messageId,
  };
}
