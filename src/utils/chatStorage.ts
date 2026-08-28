const CHAT_USER_ID_STORAGE_KEY = 'moment.chat.userId';
const CHAT_CONVERSATIONS_STORAGE_KEY = 'moment.chat.conversations';

type ChatStorage = Pick<Storage, 'getItem' | 'setItem'>;
type ConversationMap = Record<string, string>;

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

export function getDailyConversationId(
  dateKey: string,
  storage: ChatStorage = window.localStorage,
): string | undefined {
  return readConversationMap(storage)[dateKey];
}

export function saveDailyConversationId(
  dateKey: string,
  conversationId: string,
  storage: ChatStorage = window.localStorage,
): void {
  const normalizedConversationId = conversationId.trim();
  if (!normalizedConversationId) return;

  storage.setItem(
    CHAT_CONVERSATIONS_STORAGE_KEY,
    JSON.stringify({
      ...readConversationMap(storage),
      [dateKey]: normalizedConversationId,
    }),
  );
}

export function getChatStorageKeys() {
  return {
    userId: CHAT_USER_ID_STORAGE_KEY,
    conversations: CHAT_CONVERSATIONS_STORAGE_KEY,
  } as const;
}

function readConversationMap(storage: ChatStorage): ConversationMap {
  const storedValue = storage.getItem(CHAT_CONVERSATIONS_STORAGE_KEY);
  if (!storedValue) return {};

  try {
    const parsed = JSON.parse(storedValue) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].trim().length > 0,
      ),
    );
  } catch {
    return {};
  }
}
