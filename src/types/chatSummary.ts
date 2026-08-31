export interface ChatSummaryMessage {
  role: 'che' | 'user';
  text: string;
}

export interface ChatSummaryRequest {
  sceneTitle: string;
  messages: ChatSummaryMessage[];
}

export interface ChatSummaryResponse {
  topicTitle: string;
  summary: string;
}

export interface ChatSummaryErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
