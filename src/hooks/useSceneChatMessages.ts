import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sendChatMessage } from '../services/chatClient';
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

export function useSceneChatMessages(scene: SceneData, cheCurrentState: CheCurrentState) {
  const chatRuntimeContext = useMemo(
    () => buildChatRuntimeContext(scene, cheCurrentState),
    [cheCurrentState, scene],
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createInitialMessage(scene)]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState(() => getOrCreateAnonymousChatUserId());
  const failedQueryRef = useRef<string | null>(null);
  const requestInFlightRef = useRef(false);
  const sceneIdRef = useRef(scene.id);

  useEffect(() => {
    sceneIdRef.current = scene.id;
    setMessages([createInitialMessage(scene)]);
    setError(null);
    failedQueryRef.current = null;
  }, [scene.id]);

  const requestReply = useCallback(async (query: string, appendUserMessage: boolean) => {
    if (requestInFlightRef.current) return;
    requestInFlightRef.current = true;
    setIsSending(true);
    setError(null);

    const now = Date.now();
    const requestSceneId = scene.id;
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
      const dateKey = toDateKey(new Date());
      const response = await sendChatMessage({
        query,
        context: chatRuntimeContext,
        conversationId: getDailyConversationId(dateKey),
        userId,
      });
      saveDailyConversationId(dateKey, response.conversationId);

      if (sceneIdRef.current !== requestSceneId) return;
      const cheMessage: ChatMessage = {
        id: `che-${response.messageId}`,
        role: 'che',
        text: response.answer,
        createdAt: new Date().toISOString(),
      };
      setMessages((currentMessages) => [...currentMessages, cheMessage]);
      failedQueryRef.current = null;
    } catch {
      if (sceneIdRef.current === requestSceneId) {
        failedQueryRef.current = query;
        setError(CHAT_ERROR_MESSAGE);
      }
    } finally {
      requestInFlightRef.current = false;
      if (sceneIdRef.current === requestSceneId) setIsSending(false);
    }
  }, [chatRuntimeContext, scene.id, userId]);

  const sendMessage = useCallback(async (text: string) => {
    const query = text.trim();
    if (!query) return;
    await requestReply(query, true);
  }, [requestReply]);

  const retryLastMessage = useCallback(async () => {
    const failedQuery = failedQueryRef.current;
    if (!failedQuery) return;
    await requestReply(failedQuery, false);
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
