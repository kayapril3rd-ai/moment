import type { ChatMessage, SceneType } from '../types/che';

const CHAT_USER_ID_STORAGE_KEY = 'moment.chat.userId';
const CHAT_SESSIONS_STORAGE_KEY = 'moment.chat.sessions';

type ChatStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
type ChatSessionMap = Record<string, StoredChatSession>;

export interface StoredChatSession {
  id: string;
  dateKey: string;
  sceneId: SceneType;
  conversationId?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export function getOrCreateAnonymousChatUserId(
  storage: ChatStorage = window.localStorage,
  createUuid: () => string = () => crypto.randomUUID(),
): string {
  const storedUserId = storage.getItem(CHAT_USER_ID_STORAGE_KEY)?.trim();
  if (storedUserId) return storedUserId;

  const userId = `moment-anon-${createUuid()}`;
  storage.setItem(CHAT_USER_ID_STORAGE_KEY, userId);
  return userId;
}

export function createChatSession(
  dateKey: string,
  sceneId: SceneType,
  messages: ChatMessage[],
  now = new Date(),
  createUuid: () => string = () => crypto.randomUUID(),
): StoredChatSession {
  const timestamp = now.toISOString();
  return {
    id: `chat-${dateKey}-${sceneId}-${createUuid()}`,
    dateKey,
    sceneId,
    messages,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function getChatSession(
  dateKey: string,
  sceneId: SceneType,
  storage: ChatStorage = window.localStorage,
): StoredChatSession | undefined {
  return readChatSessionMap(storage)[getChatSessionSlotKey(dateKey, sceneId)];
}

export function saveChatSession(
  session: StoredChatSession,
  storage: ChatStorage = window.localStorage,
): void {
  try {
    storage.setItem(
      CHAT_SESSIONS_STORAGE_KEY,
      JSON.stringify({
        ...readChatSessionMap(storage),
        [getChatSessionSlotKey(session.dateKey, session.sceneId)]: session,
      }),
    );
  } catch {
    // Keep the in-memory chat usable when local storage is unavailable.
  }
}

export function clearChatSession(
  dateKey: string,
  sceneId: SceneType,
  storage: ChatStorage = window.localStorage,
): void {
  const sessions = readChatSessionMap(storage);
  delete sessions[getChatSessionSlotKey(dateKey, sceneId)];
  try {
    if (Object.keys(sessions).length === 0) {
      storage.removeItem(CHAT_SESSIONS_STORAGE_KEY);
      return;
    }
    storage.setItem(CHAT_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // End still invalidates the active in-memory session.
  }
}

export function getChatSessionSlotKey(dateKey: string, sceneId: SceneType): string {
  return `${dateKey}:${sceneId}`;
}

export function getChatStorageKeys() {
  return {
    userId: CHAT_USER_ID_STORAGE_KEY,
    sessions: CHAT_SESSIONS_STORAGE_KEY,
  } as const;
}

function readChatSessionMap(storage: ChatStorage): ChatSessionMap {
  const storedValue = storage.getItem(CHAT_SESSIONS_STORAGE_KEY);
  if (!storedValue) return {};

  try {
    const parsed = JSON.parse(storedValue) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, StoredChatSession] => isStoredChatSession(entry[1])),
    );
  } catch {
    return {};
  }
}

function isStoredChatSession(value: unknown): value is StoredChatSession {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const session = value as Partial<StoredChatSession>;
  return typeof session.id === 'string'
    && typeof session.dateKey === 'string'
    && typeof session.sceneId === 'string'
    && (session.conversationId === undefined || typeof session.conversationId === 'string')
    && Array.isArray(session.messages)
    && session.messages.every(isChatMessage)
    && typeof session.createdAt === 'string'
    && typeof session.updatedAt === 'string';
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const message = value as Partial<ChatMessage>;
  return typeof message.id === 'string'
    && (message.role === 'che' || message.role === 'user')
    && typeof message.text === 'string'
    && typeof message.createdAt === 'string';
}
