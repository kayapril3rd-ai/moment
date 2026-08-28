import type { ChatRequest, ChatResponse } from '../src/types/chat.ts';

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
  ) {
    return null;
  }

  return {
    query: request.query.trim(),
    context,
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
    },
    query: request.query,
    response_mode: 'blocking',
    conversation_id: request.conversationId ?? '',
    user: request.userId,
    files: [],
  };
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
