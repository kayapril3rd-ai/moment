import type { ChatErrorResponse, ChatRequest, ChatResponse } from '../types/chat';

const CHAT_ENDPOINT = '/api/chat';
const CHAT_TIMEOUT_MS = 45_000;

export class ChatClientError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code = 'CHAT_REQUEST_FAILED', status?: number) {
    super(message);
    this.name = 'ChatClientError';
    this.code = code;
    this.status = status;
  }
}

interface SendChatOptions {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export async function sendChatMessage(
  request: ChatRequest,
  options: SendChatOptions = {},
): Promise<ChatResponse> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), options.timeoutMs ?? CHAT_TIMEOUT_MS);

  try {
    const response = await fetchImpl(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    const payload = await readJson(response);

    if (!response.ok) {
      const errorPayload = payload as Partial<ChatErrorResponse>;
      throw new ChatClientError(
        errorPayload.error?.message ?? '聊天请求失败。',
        errorPayload.error?.code ?? 'CHAT_REQUEST_FAILED',
        response.status,
      );
    }

    if (!isChatResponse(payload)) {
      throw new ChatClientError('聊天服务返回了无法识别的结果。', 'INVALID_CHAT_RESPONSE', response.status);
    }

    return payload;
  } catch (error) {
    if (error instanceof ChatClientError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ChatClientError('聊天请求超时。', 'CHAT_TIMEOUT');
    }
    throw new ChatClientError('无法连接聊天服务。');
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

function isChatResponse(value: unknown): value is ChatResponse {
  if (!value || typeof value !== 'object') return false;
  const response = value as Partial<ChatResponse>;
  return typeof response.answer === 'string'
    && response.answer.trim().length > 0
    && typeof response.conversationId === 'string'
    && response.conversationId.trim().length > 0
    && typeof response.messageId === 'string'
    && response.messageId.trim().length > 0;
}
