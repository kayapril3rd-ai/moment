import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ChatErrorResponse } from '../src/types/chat';
import {
  buildDifyBlockingRequest,
  parseDifyBlockingResponse,
  parseMomentChatRequest,
} from './_lib/difyChatContract.js';

const DEFAULT_DIFY_API_BASE_URL = 'https://api.dify.ai/v1';
const UPSTREAM_TIMEOUT_MS = 45_000;

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendError(response, 405, 'METHOD_NOT_ALLOWED', '只支持 POST 请求。');
  }

  const requestBody = parseRequestBody(request.body);
  const chatRequest = parseMomentChatRequest(requestBody);
  if (!chatRequest) {
    return sendError(response, 400, 'INVALID_CHAT_REQUEST', '聊天请求格式不正确。');
  }

  const apiKey = process.env.DIFY_API_KEY?.trim();
  if (!apiKey) {
    return sendError(response, 500, 'CHAT_SERVER_NOT_CONFIGURED', '聊天服务尚未完成配置。');
  }

  const apiBaseUrl = (process.env.DIFY_API_BASE_URL?.trim() || DEFAULT_DIFY_API_BASE_URL).replace(/\/+$/, '');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstreamResponse = await fetch(`${apiBaseUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildDifyBlockingRequest(chatRequest)),
      signal: controller.signal,
    });

    if (!upstreamResponse.ok) {
      return sendError(response, 502, 'DIFY_UPSTREAM_FAILED', '上游聊天服务暂时不可用。');
    }

    let upstreamBody: unknown;
    try {
      upstreamBody = await upstreamResponse.json();
    } catch {
      return sendError(response, 502, 'DIFY_INVALID_RESPONSE', '上游聊天服务返回了无效结果。');
    }

    const chatResponse = parseDifyBlockingResponse(upstreamBody);
    if (!chatResponse) {
      return sendError(response, 502, 'DIFY_INVALID_RESPONSE', '上游聊天服务返回了无效结果。');
    }

    return response.status(200).json(chatResponse);
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    return sendError(
      response,
      502,
      isTimeout ? 'DIFY_UPSTREAM_TIMEOUT' : 'DIFY_UPSTREAM_FAILED',
      isTimeout ? '上游聊天服务响应超时。' : '上游聊天服务暂时不可用。',
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseRequestBody(body: unknown): unknown {
  if (typeof body !== 'string') return body;
  try {
    return JSON.parse(body) as unknown;
  } catch {
    return null;
  }
}

function sendError(
  response: VercelResponse,
  status: number,
  code: string,
  message: string,
) {
  const body: ChatErrorResponse = { error: { code, message } };
  return response.status(status).json(body);
}
