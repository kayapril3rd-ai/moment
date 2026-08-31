import type { ConversationMemoryKind } from './memory';

export interface ChatSummaryMessage {
  role: 'che' | 'user';
  text: string;
}

export interface ChatSummaryMemoryItem {
  kind: ConversationMemoryKind;
  text: string;
}

export interface ChatSummaryRequest {
  sceneTitle: string;
  messages: ChatSummaryMessage[];
}

export interface ChatSummaryResponse {
  /** Semantic topic, not a scene label or a mechanical copy of the first message. */
  topicTitle: string;
  /** One concise recollection in 澈's natural voice. */
  summary: string;
  /** Explicitly grounded facts or events worth carrying into later chats. */
  conversationMemories: ChatSummaryMemoryItem[];
}

export interface EndedChatProcessingResult {
  recordId: string;
  dateKey: string;
  summary: ChatSummaryResponse;
}

export interface ChatSummaryErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
