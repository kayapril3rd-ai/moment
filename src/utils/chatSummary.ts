import type { ChatMessage, DayRecord } from '../types/che';
import type { ChatSummaryResponse } from '../types/chatSummary';

const FALLBACK_TITLE_MAX_LENGTH = 18;
const FALLBACK_SUMMARY_MAX_LENGTH = 100;

export function createChatSummaryFallback(messages: ChatMessage[]): ChatSummaryResponse {
  const userMessages = messages
    .filter((message) => message.role === 'user')
    .map((message) => message.text.trim())
    .filter(Boolean);
  const firstMessage = userMessages[0] ?? '聊了一会儿';
  const summarySource = userMessages.slice(0, 2).join('；') || firstMessage;
  return {
    topicTitle: truncateText(firstMessage, FALLBACK_TITLE_MAX_LENGTH),
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
