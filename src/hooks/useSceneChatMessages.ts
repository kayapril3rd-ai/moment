import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sendChatMessage } from '../services/chatClient';
import type { ChatRequest, ChatUserContext } from '../types/chat';
import type { ChatMessage, CheCurrentState, SceneData } from '../types/che';
import { buildChatRuntimeContext } from '../utils/agentSceneContext';
import {
  getDailyConversationId,
  getOrCreateAnonymousChatUserId,
  saveDailyConversationId,
} from '../utils/chatStorage';
import { toDateKey } from '../utils/date';
import { getSceneOpeningMessage } from '../utils/reply';

const CHAT_ERROR_MESSAGE = '刚刚没连上，再试一次。';

interface FailedChatRequest {
  dateKey: string;
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
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createInitialMessage(scene)]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState(() => getOrCreateAnonymousChatUserId());
  const failedRequestRef = useRef<FailedChatRequest | null>(null);
  const requestInFlightRef = useRef(false);
  const sceneIdRef = useRef(scene.id);

  useEffect(() => {
    sceneIdRef.current = scene.id;
    setMessages([createInitialMessage(scene)]);
    setError(null);
    failedRequestRef.current = null;
  }, [scene.id]);

  const requestReply = useCallback(async (
    query: string,
    appendUserMessage: boolean,
    retryAttempt?: FailedChatRequest,
  ) => {
    if (requestInFlightRef.current) return;
    requestInFlightRef.current = true;
    setIsSending(true);
    setError(null);

    const now = Date.now();
    const requestSceneId = scene.id;
    const dateKey = retryAttempt?.dateKey ?? toDateKey(new Date(now));
    const request: ChatRequest = retryAttempt?.request ?? {
      query,
      context: chatRuntimeContext,
      userContext,
      conversationId: getDailyConversationId(dateKey),
      userId,
    };
    if (appendUserMessage) {
      const userMessage: ChatMessage = {
        id: `user-${now}-${crypto.randomUUID()}`,
        role: 'user',
        text: query,
        createdAt: new Date(now).toISOString(),
      };
      setMessages((currentMessages) => [...currentMessages, userMessage]);
    }

    try {
      const response = await sendChatMessage(request);
      saveDailyConversationId(dateKey, response.conversationId);

      if (sceneIdRef.current !== requestSceneId) return;
      const cheMessage: ChatMessage = {
        id: `che-${response.messageId}`,
        role: 'che',
        text: response.answer,
        createdAt: new Date().toISOString(),
      };
      setMessages((currentMessages) => [...currentMessages, cheMessage]);
      failedRequestRef.current = null;
    } catch {
      if (sceneIdRef.current === requestSceneId) {
        failedRequestRef.current = { dateKey, request };
        setError(CHAT_ERROR_MESSAGE);
      }
    } finally {
      requestInFlightRef.current = false;
      if (sceneIdRef.current === requestSceneId) setIsSending(false);
    }
  }, [chatRuntimeContext, scene.id, userContext, userId]);

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

  return {
    chatRuntimeContext,
    error,
    isSending,
    messages,
    retryLastMessage,
    sendMessage,
  };
}

function createInitialMessage(scene: SceneData): ChatMessage {
  return {
    id: `che-opening-${scene.id}`,
    role: 'che',
    text: getSceneOpeningMessage(scene),
    createdAt: new Date().toISOString(),
  };
}
