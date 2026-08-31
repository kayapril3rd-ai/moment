import type {
  ChatSummaryErrorResponse,
  ChatSummaryRequest,
  ChatSummaryResponse,
} from '../types/chatSummary';

const CHAT_SUMMARY_ENDPOINT = '/api/chat-summary';
const CHAT_SUMMARY_TIMEOUT_MS = 30_000;

interface SummarizeEndedChatOptions {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export async function summarizeEndedChat(
  request: ChatSummaryRequest,
  options: SummarizeEndedChatOptions = {},
): Promise<ChatSummaryResponse> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), options.timeoutMs ?? CHAT_SUMMARY_TIMEOUT_MS);

  try {
    const response = await (options.fetchImpl ?? fetch)(CHAT_SUMMARY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    const payload = await readJson(response);
    if (!response.ok) {
      const error = payload as Partial<ChatSummaryErrorResponse>;
      throw new Error(error.error?.message ?? '聊天摘要请求失败。');
    }
    if (!isChatSummaryResponse(payload)) throw new Error('聊天摘要返回了无法识别的结果。');
    return payload;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function isChatSummaryResponse(value: unknown): value is ChatSummaryResponse {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const response = value as Partial<ChatSummaryResponse>;
  return typeof response.topicTitle === 'string'
    && response.topicTitle.trim().length > 0
    && typeof response.summary === 'string'
    && response.summary.trim().length > 0
    && Array.isArray(response.conversationMemories);
}
