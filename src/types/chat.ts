import type { ChatRuntimeContext } from './che';

export interface ChatRequest {
  query: string;
  context: ChatRuntimeContext;
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
