import type { ChatSummaryMemoryItem } from '../types/chatSummary';
import type { ConversationMemory } from '../types/memory';

const CONVERSATION_MEMORY_STORAGE_KEY = 'lumen.conversationMemories';
const MAX_CONVERSATION_MEMORIES = 30;
const MAX_SUMMARY_MEMORY_ITEMS = 3;
const MAX_MEMORY_TEXT_LENGTH = 160;

type ConversationMemoryStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

interface AddConversationMemoriesOptions {
  now?: Date;
  createUuid?: () => string;
}

export function readConversationMemories(
  storage: ConversationMemoryStorage = window.localStorage,
): ConversationMemory[] {
  try {
    const parsed = JSON.parse(storage.getItem(CONVERSATION_MEMORY_STORAGE_KEY) ?? '[]') as unknown;
    if (!Array.isArray(parsed)) return [];
    return applyRetention(parsed.filter(isConversationMemory).map(normalizeStoredMemory));
  } catch {
    return [];
  }
}

export function writeConversationMemories(
  memories: ConversationMemory[],
  storage: ConversationMemoryStorage = window.localStorage,
): void {
  try {
    storage.setItem(CONVERSATION_MEMORY_STORAGE_KEY, JSON.stringify(applyRetention(memories)));
  } catch {
    // In-memory state remains usable when localStorage is unavailable.
  }
}

export function clearConversationMemoryStorage(
  storage: ConversationMemoryStorage = window.localStorage,
): void {
  try {
    storage.removeItem(CONVERSATION_MEMORY_STORAGE_KEY);
  } catch {
    // The hook still clears its in-memory state.
  }
}

export function addConversationMemories(
  currentMemories: ConversationMemory[],
  summaryItems: ChatSummaryMemoryItem[],
  sourceDate: string,
  sourceRecordId: string,
  explicitMemoryItems: string[],
  options: AddConversationMemoriesOptions = {},
): ConversationMemory[] {
  const now = options.now ?? new Date();
  const timestamp = now.toISOString();
  const createUuid = options.createUuid ?? createConversationMemoryUuid;
  const explicitKeys = new Set(explicitMemoryItems.map(toDedupeKey).filter(Boolean));
  const next = [...currentMemories];

  normalizeSummaryItems(summaryItems).forEach((item) => {
    const textKey = toDedupeKey(item.text);
    if (item.kind === 'fact' && explicitKeys.has(textKey)) return;

    const existingIndex = next.findIndex((memory) => (
      memory.kind === item.kind
      && toDedupeKey(memory.text) === textKey
      && (item.kind === 'fact' || memory.sourceDate === sourceDate)
    ));
    if (existingIndex >= 0) {
      next[existingIndex] = { ...next[existingIndex], updatedAt: timestamp };
      return;
    }

    next.push({
      id: `conversation-memory-${createUuid()}`,
      kind: item.kind,
      text: item.text,
      sourceDate,
      sourceRecordId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });

  return applyRetention(next);
}

export function formatConversationMemoriesForChat(memories: ConversationMemory[]): string[] {
  return [...memories]
    .sort((a, b) => b.sourceDate.localeCompare(a.sourceDate) || b.updatedAt.localeCompare(a.updatedAt))
    .map((memory) => memory.kind === 'event' ? `[${memory.sourceDate}] ${memory.text}` : memory.text);
}

export function getConversationMemoryStorageKey(): string {
  return CONVERSATION_MEMORY_STORAGE_KEY;
}

function normalizeSummaryItems(items: ChatSummaryMemoryItem[]): ChatSummaryMemoryItem[] {
  const seen = new Set<string>();
  const normalized: ChatSummaryMemoryItem[] = [];

  for (const item of items) {
    if (!item || (item.kind !== 'fact' && item.kind !== 'event') || typeof item.text !== 'string') continue;
    const text = normalizeText(item.text).slice(0, MAX_MEMORY_TEXT_LENGTH).trim();
    if (!text) continue;
    const key = `${item.kind}:${toDedupeKey(text)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push({ kind: item.kind, text });
    if (normalized.length === MAX_SUMMARY_MEMORY_ITEMS) break;
  }

  return normalized;
}

function applyRetention(memories: ConversationMemory[]): ConversationMemory[] {
  const retained = [...memories];
  while (retained.length > MAX_CONVERSATION_MEMORIES) {
    const oldestEventIndex = findOldestIndex(retained, 'event');
    const removeIndex = oldestEventIndex >= 0 ? oldestEventIndex : findOldestIndex(retained, 'fact');
    if (removeIndex < 0) break;
    retained.splice(removeIndex, 1);
  }
  return retained;
}

function findOldestIndex(memories: ConversationMemory[], kind: ConversationMemory['kind']): number {
  let oldestIndex = -1;
  let oldestTimestamp = Number.POSITIVE_INFINITY;
  memories.forEach((memory, index) => {
    if (memory.kind !== kind) return;
    const timestamp = new Date(memory.createdAt).getTime();
    const comparable = Number.isFinite(timestamp) ? timestamp : 0;
    if (comparable < oldestTimestamp) {
      oldestTimestamp = comparable;
      oldestIndex = index;
    }
  });
  return oldestIndex;
}

function normalizeStoredMemory(memory: ConversationMemory): ConversationMemory {
  return { ...memory, text: normalizeText(memory.text).slice(0, MAX_MEMORY_TEXT_LENGTH).trim() };
}

function isConversationMemory(value: unknown): value is ConversationMemory {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const memory = value as Partial<ConversationMemory>;
  return typeof memory.id === 'string'
    && (memory.kind === 'fact' || memory.kind === 'event')
    && typeof memory.text === 'string'
    && normalizeText(memory.text).length > 0
    && typeof memory.sourceDate === 'string'
    && typeof memory.sourceRecordId === 'string'
    && typeof memory.createdAt === 'string'
    && typeof memory.updatedAt === 'string';
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function toDedupeKey(value: string): string {
  return normalizeText(value).toLocaleLowerCase();
}

function createConversationMemoryUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
