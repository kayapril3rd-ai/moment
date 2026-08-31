import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sendChatMessage } from '../services/chatClient';
import type { ChatRequest, ChatUserContext } from '../types/chat';
import type { ChatMessage, CheCurrentState, SceneData } from '../types/che';
import { buildChatRuntimeContext } from '../utils/agentSceneContext';
import {
  clearChatSession,
  createChatSession,
  getChatSession,
  getOrCreateAnonymousChatUserId,
  saveChatSession,
  type StoredChatSession,
} from '../utils/chatStorage';
import { toDateKey } from '../utils/date';
import { getSceneOpeningMessage } from '../utils/reply';

const CHAT_ERROR_MESSAGE = '刚刚没连上，再试一次。';

interface FailedChatRequest {
  sessionId: string;
  request: ChatRequest;
}

export function useSceneChatMessages(
  scene: SceneData,
  cheCurrentState: CheCurrentState,
  userContext: ChatUserContext,
) {
  const chatRuntimeContext = useMemo(
    () => buildChatRuntimeContext(scene, cheCurrentState),
    [cheCurrentState, scene],
  );
  const [session, setSession] = useState<StoredChatSession>(() => loadOrCreateSession(scene));
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState(() => getOrCreateAnonymousChatUserId());
  const sessionRef = useRef(session);
  const activeSessionIdRef = useRef<string | null>(session.id);
  const failedRequestRef = useRef<FailedChatRequest | null>(null);
  const requestInFlightRef = useRef(false);
  const currentDateKey = toDateKey(new Date());

  useEffect(() => {
    if (sessionRef.current.sceneId === scene.id && sessionRef.current.dateKey === currentDateKey) return;
    const nextSession = loadOrCreateSession(scene, currentDateKey);
    sessionRef.current = nextSession;
    activeSessionIdRef.current = nextSession.id;
    setSession(nextSession);
    setError(null);
    setIsSending(false);
    failedRequestRef.current = null;
    requestInFlightRef.current = false;
  }, [currentDateKey, scene]);

  const updateSession = useCallback((updater: (current: StoredChatSession) => StoredChatSession) => {
    const current = sessionRef.current;
    if (activeSessionIdRef.current !== current.id) return;
    const next = { ...updater(current), updatedAt: new Date().toISOString() };
    sessionRef.current = next;
    saveChatSession(next);
    setSession(next);
  }, []);

  const requestReply = useCallback(async (
    query: string,
    appendUserMessage: boolean,
    retryAttempt?: FailedChatRequest,
  ) => {
    if (requestInFlightRef.current) return;
    const sessionSnapshot = sessionRef.current;
    const requestSessionId = retryAttempt?.sessionId ?? sessionSnapshot.id;
    if (activeSessionIdRef.current !== requestSessionId) return;

    requestInFlightRef.current = true;
    setIsSending(true);
    setError(null);

    const now = new Date();
    const request: ChatRequest = retryAttempt?.request ?? {
      query,
      context: chatRuntimeContext,
      userContext,
      conversationId: sessionSnapshot.conversationId,
      userId,
    };
    if (appendUserMessage) {
      const userMessage: ChatMessage = {
        id: `user-${now.getTime()}-${crypto.randomUUID()}`,
        role: 'user',
        text: query,
        createdAt: now.toISOString(),
      };
      updateSession((current) => ({ ...current, messages: [...current.messages, userMessage] }));
    }

    try {
      const response = await sendChatMessage(request);
      if (activeSessionIdRef.current !== requestSessionId) return;
      const cheMessage: ChatMessage = {
        id: `che-${response.messageId}`,
        role: 'che',
        text: response.answer,
        createdAt: new Date().toISOString(),
      };
      updateSession((current) => ({
        ...current,
        conversationId: response.conversationId,
        messages: [...current.messages, cheMessage],
      }));
      failedRequestRef.current = null;
    } catch {
      if (activeSessionIdRef.current === requestSessionId) {
        failedRequestRef.current = { sessionId: requestSessionId, request };
        setError(CHAT_ERROR_MESSAGE);
      }
    } finally {
      requestInFlightRef.current = false;
      if (activeSessionIdRef.current === requestSessionId) setIsSending(false);
    }
  }, [chatRuntimeContext, updateSession, userContext, userId]);

  const sendMessage = useCallback(async (text: string) => {
    const query = text.trim();
    if (!query) return;
    await requestReply(query, true);
  }, [requestReply]);

  const retryLastMessage = useCallback(async () => {
    const failedRequest = failedRequestRef.current;
    if (!failedRequest) return;
    await requestReply(failedRequest.request.query, false, failedRequest);
  }, [requestReply]);

  const endSession = useCallback((): StoredChatSession => {
    const endedSession = sessionRef.current;
    activeSessionIdRef.current = null;
    failedRequestRef.current = null;
    clearChatSession(endedSession.dateKey, endedSession.sceneId);
    return endedSession;
  }, []);

  return {
    chatRuntimeContext,
    endSession,
    error,
    isSending,
    messages: session.messages,
    retryLastMessage,
    sendMessage,
  };
}

function loadOrCreateSession(scene: SceneData, dateKey = toDateKey(new Date())): StoredChatSession {
  const storedSession = getChatSession(dateKey, scene.id);
  if (storedSession) return storedSession;

  const now = new Date();
  const session = createChatSession(dateKey, scene.id, [createInitialMessage(scene, now)], now);
  saveChatSession(session);
  return session;
}

function createInitialMessage(scene: SceneData, now: Date): ChatMessage {
  return {
    id: `che-opening-${scene.id}-${now.getTime()}`,
    role: 'che',
    text: getSceneOpeningMessage(scene),
    createdAt: now.toISOString(),
  };
}
