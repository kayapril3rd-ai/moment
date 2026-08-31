import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import chatHandler from '../api/chat.ts';
import {
  buildDifyBlockingRequest,
  formatMemoryContext,
  normalizeChatUserContext,
  parseDifyBlockingResponse,
  parseMomentChatRequest,
} from '../api/_lib/difyChatContract.ts';
import type { ChatRequest } from '../src/types/chat.ts';
import {
  clearChatSession,
  createChatSession,
  getChatSession,
  getChatSessionSlotKey,
  getChatStorageKeys,
  getOrCreateAnonymousChatUserId,
  saveChatSession,
} from '../src/utils/chatStorage.ts';

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

class MockServerResponse {
  statusCode = 200;
  body: unknown;
  headers = new Map<string, string>();

  setHeader(name: string, value: string) {
    this.headers.set(name, value);
  }

  status(statusCode: number) {
    this.statusCode = statusCode;
    return this;
  }

  json(body: unknown) {
    this.body = body;
  }
}

const storage = new MemoryStorage();
const storageKeys = getChatStorageKeys();
assert.equal(storageKeys.userId, 'moment.chat.userId');
assert.equal(storageKeys.sessions, 'moment.chat.sessions');

const firstUserId = getOrCreateAnonymousChatUserId(storage, () => 'fixed-uuid');
const secondUserId = getOrCreateAnonymousChatUserId(storage, () => 'unused-uuid');
assert.equal(firstUserId, 'moment-anon-fixed-uuid');
assert.equal(secondUserId, firstUserId);

const openingMessage = {
  id: 'opening-study',
  role: 'che' as const,
  text: '我在书桌边。',
  createdAt: '2026-08-28T09:00:00.000Z',
};
const studySession = createChatSession(
  '2026-08-28',
  'study',
  [openingMessage],
  new Date('2026-08-28T09:00:00.000Z'),
  () => 'study-session',
);
saveChatSession(studySession, storage);
assert.deepEqual(getChatSession('2026-08-28', 'study', storage), studySession);
assert.equal(getChatSession('2026-08-28', 'watch', storage), undefined);
assert.equal(getChatSession('2026-08-29', 'study', storage), undefined);
assert.equal(getChatSessionSlotKey('2026-08-28', 'study'), '2026-08-28:study');

const continuedStudySession = {
  ...studySession,
  conversationId: 'conversation-study',
  messages: [
    ...studySession.messages,
    { id: 'user-one', role: 'user' as const, text: '今天有点冷。', createdAt: '2026-08-28T09:01:00.000Z' },
  ],
  updatedAt: '2026-08-28T09:01:00.000Z',
};
saveChatSession(continuedStudySession, storage);
assert.equal(getChatSession('2026-08-28', 'study', storage)?.conversationId, 'conversation-study');
assert.equal(getChatSession('2026-08-28', 'study', storage)?.messages.length, 2);

const watchSession = createChatSession('2026-08-28', 'watch', [], new Date('2026-08-28T10:00:00.000Z'), () => 'watch-session');
const nextDayStudySession = createChatSession('2026-08-29', 'study', [], new Date('2026-08-29T10:00:00.000Z'), () => 'next-day-study');
saveChatSession(watchSession, storage);
saveChatSession(nextDayStudySession, storage);
assert.equal(getChatSession('2026-08-28', 'watch', storage)?.id, watchSession.id);
assert.equal(getChatSession('2026-08-29', 'study', storage)?.id, nextDayStudySession.id);

clearChatSession('2026-08-28', 'study', storage);
assert.equal(getChatSession('2026-08-28', 'study', storage), undefined);
assert.equal(getChatSession('2026-08-28', 'watch', storage)?.id, watchSession.id);
assert.equal(getChatSession('2026-08-29', 'study', storage)?.id, nextDayStudySession.id);

const momentRequest: ChatRequest = {
  query: '今天工作还顺利吗',
  context: {
    chatMode: 'scene',
    sceneKey: 'focus',
    sceneVariant: 'work_desk',
    cheCurrentState: '澈现在在书桌前处理体验方案。',
  },
  userContext: {
    nickname: '小琪',
    companionStyle: '具体一点、自然接话',
    chatPace: '慢一点、少催促',
    dislikes: '太油腻、说教、空泛安慰',
    memoryItems: ['我养了一只狗', '最近在准备面试'],
  },
  conversationId: 'conversation-day-one',
  userId: firstUserId,
};

assert.deepEqual(parseMomentChatRequest(momentRequest), momentRequest);
assert.equal(parseMomentChatRequest({ ...momentRequest, query: '' }), null);
assert.equal(parseMomentChatRequest({
  ...momentRequest,
  userContext: { ...momentRequest.userContext, memoryItems: ['valid', 42] },
}), null);

assert.deepEqual(normalizeChatUserContext({
  nickname: '  小琪  ',
  companionStyle: '  自然接话 ',
  chatPace: '',
  dislikes: '  ',
  memoryItems: ['  我养了一只狗 ', '', '  最近在准备面试  '],
}), {
  nickname: '小琪',
  companionStyle: '自然接话',
  chatPace: '',
  dislikes: '',
  memoryItems: ['我养了一只狗', '最近在准备面试'],
});
assert.equal(
  formatMemoryContext(['我养了一只狗', '最近在准备面试']),
  '我明确记得的用户事实：\n\n- 我养了一只狗\n- 最近在准备面试',
);
assert.equal(formatMemoryContext([]), '暂无明确记忆。');
const boundedUserContext = normalizeChatUserContext({
  ...momentRequest.userContext,
  memoryItems: Array.from({ length: 24 }, (_, index) => `${index}-${'x'.repeat(320)}`),
});
assert.equal(boundedUserContext?.memoryItems.length, 20);
assert.equal(boundedUserContext?.memoryItems[0]?.length, 300);

const difyRequest = buildDifyBlockingRequest(momentRequest);
assert.deepEqual(difyRequest, {
  inputs: {
    chatMode: 'scene',
    sceneKey: 'focus',
    sceneVariant: 'work_desk',
    cheCurrentState: '澈现在在书桌前处理体验方案。',
    nickname: '小琪',
    companionStyle: '具体一点、自然接话',
    chatPace: '慢一点、少催促',
    dislikes: '太油腻、说教、空泛安慰',
    memoryContext: '我明确记得的用户事实：\n\n- 我养了一只狗\n- 最近在准备面试',
  },
  query: '今天工作还顺利吗',
  response_mode: 'blocking',
  conversation_id: 'conversation-day-one',
  user: 'moment-anon-fixed-uuid',
  files: [],
});
assert.equal('query' in difyRequest.inputs, false);

const emptyMemoryRequest = buildDifyBlockingRequest({
  ...momentRequest,
  userContext: { ...momentRequest.userContext, memoryItems: [] },
});
assert.equal(emptyMemoryRequest.inputs.memoryContext, '暂无明确记忆。');

const firstDifyRequest = buildDifyBlockingRequest({ ...momentRequest, conversationId: undefined });
assert.equal(firstDifyRequest.conversation_id, '');

const mappedResponse = parseDifyBlockingResponse({
  answer: '还算顺利，下午把手上的一版收完。',
  conversation_id: 'conversation-day-one',
  message_id: 'message-one',
  metadata: { ignored: true },
});
assert.deepEqual(mappedResponse, {
  answer: '还算顺利，下午把手上的一版收完。',
  conversationId: 'conversation-day-one',
  messageId: 'message-one',
});
assert.equal(parseDifyBlockingResponse({ answer: '缺少 conversation id' }), null);

const methodResponse = new MockServerResponse();
await chatHandler({ method: 'GET' } as never, methodResponse as never);
assert.equal(methodResponse.statusCode, 405);
assert.equal(methodResponse.headers.get('Allow'), 'POST');

const invalidResponse = new MockServerResponse();
await chatHandler({ method: 'POST', body: { query: '' } } as never, invalidResponse as never);
assert.equal(invalidResponse.statusCode, 400);

const invalidMemoryResponse = new MockServerResponse();
await chatHandler({
  method: 'POST',
  body: { ...momentRequest, userContext: { ...momentRequest.userContext, memoryItems: 'not-an-array' } },
} as never, invalidMemoryResponse as never);
assert.equal(invalidMemoryResponse.statusCode, 400);

const previousApiKey = process.env.DIFY_API_KEY;
const previousFetch = globalThis.fetch;
delete process.env.DIFY_API_KEY;
const configResponse = new MockServerResponse();
await chatHandler({ method: 'POST', body: momentRequest } as never, configResponse as never);
assert.equal(configResponse.statusCode, 500);

process.env.DIFY_API_KEY = 'test-only-key';
globalThis.fetch = async () => new Response('<html>sensitive upstream body</html>', { status: 500 });
const upstreamFailureResponse = new MockServerResponse();
await chatHandler({ method: 'POST', body: momentRequest } as never, upstreamFailureResponse as never);
assert.equal(upstreamFailureResponse.statusCode, 502);
assert.equal(JSON.stringify(upstreamFailureResponse.body).includes('sensitive upstream body'), false);

globalThis.fetch = async () => new Response(JSON.stringify({
  answer: 'server mapped answer',
  conversation_id: 'server-conversation',
  message_id: 'server-message',
  metadata: { hidden: true },
}), { status: 200, headers: { 'Content-Type': 'application/json' } });
const successResponse = new MockServerResponse();
await chatHandler({ method: 'POST', body: momentRequest } as never, successResponse as never);
assert.equal(successResponse.statusCode, 200);
assert.deepEqual(successResponse.body, {
  answer: 'server mapped answer',
  conversationId: 'server-conversation',
  messageId: 'server-message',
});

globalThis.fetch = previousFetch;
if (previousApiKey === undefined) delete process.env.DIFY_API_KEY;
else process.env.DIFY_API_KEY = previousApiKey;

const clientSource = await readFile(new URL('../src/services/chatClient.ts', import.meta.url), 'utf8');
assert.equal(clientSource.includes('DIFY_API_KEY'), false);

const apiSource = await readFile(new URL('../api/chat.ts', import.meta.url), 'utf8');
assert.equal(apiSource.includes("from './_lib/difyChatContract.js'"), true);
assert.equal(apiSource.includes('../server/'), false);
assert.equal(/from\s+['"][^'"]+\.ts['"]/.test(apiSource), false);
await assert.rejects(readFile(new URL('../server/difyChatContract.ts', import.meta.url), 'utf8'));

console.log(JSON.stringify({
  stableUserId: firstUserId,
  storageKeys,
  chatSessions: {
    restoredConversationId: continuedStudySession.conversationId,
    endedStudyCleared: getChatSession('2026-08-28', 'study', storage) === undefined,
    separateScene: getChatSession('2026-08-28', 'watch', storage)?.id,
    separateDate: getChatSession('2026-08-29', 'study', storage)?.id,
  },
  difyRequest,
  mappedResponse,
  serverErrors: {
    method: methodResponse.statusCode,
    invalid: invalidResponse.statusCode,
    invalidMemory: invalidMemoryResponse.statusCode,
    config: configResponse.statusCode,
    upstream: upstreamFailureResponse.statusCode,
  },
  serverSuccess: successResponse.body,
  deploymentImport: './_lib/difyChatContract.js',
}, null, 2));
