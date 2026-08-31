export interface ChatSummaryMessage {
  role: 'che' | 'user';
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
}

export interface ChatSummaryErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
