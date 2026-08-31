import type { ChatMessage, DayRecord, SceneType } from '../types/che';
import type { ChatSummaryResponse } from '../types/chatSummary';

const FALLBACK_TITLE_MAX_LENGTH = 18;
const FALLBACK_SUMMARY_MAX_LENGTH = 100;

export function createChatSummaryFallback(messages: ChatMessage[], sceneType: SceneType): ChatSummaryResponse {
  const userMessages = messages
    .filter((message) => message.role === 'user')
    .map((message) => message.text.trim())
    .filter(Boolean);
  const firstMessage = userMessages[0] ?? '刚才聊了一会儿';
  const secondMessage = userMessages[1];
  const summarySource = secondMessage
    ? `你刚才提到“${firstMessage}”，后来又说“${secondMessage}”。`
    : `你刚才提到“${firstMessage}”。`;
  return {
    topicTitle: sceneType === 'deep_room' ? '这次安静聊到的事' : '这次聊到的事',
    summary: truncateText(summarySource, FALLBACK_SUMMARY_MAX_LENGTH),
  };
}

export function formatChatTranscript(messages: ChatMessage[]): string {
  return messages.map((message) => `${message.role === 'che' ? '澈' : '我'}：${message.text}`).join('\n');
}

export function applyChatSummaryToRecord(
  records: DayRecord[],
  recordId: string,
  summary: ChatSummaryResponse,
): DayRecord[] {
  return records.map((record) => record.id === recordId
    ? { ...record, title: summary.topicTitle, summary: summary.summary }
    : record);
}

function truncateText(value: string, maxLength: number): string {
  const normalized = value.trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}…` : normalized;
}
