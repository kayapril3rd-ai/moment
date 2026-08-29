import type { ChatRuntimeContext } from './che';

export interface ChatUserContext {
  nickname: string;
  companionStyle: string;
  chatPace: string;
  dislikes: string;
  memoryItems: string[];
}

export interface ChatRequest {
  query: string;
  context: ChatRuntimeContext;
  userContext: ChatUserContext;
  conversationId?: string;
  userId: string;
}

export interface ChatResponse {
  answer: string;
  conversationId: string;
  messageId: string;
}

export interface ChatErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
