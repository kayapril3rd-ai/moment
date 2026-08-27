import { useEffect, useMemo, useState } from 'react';
import type { ChatMessage, SceneData } from '../types/che';
import { getAgentSceneContext } from '../utils/agentSceneContext';
import { getMockSceneReply, getSceneOpeningMessage } from '../utils/reply';

export function useSceneChatMessages(scene: SceneData) {
  const agentSceneContext = getAgentSceneContext(scene.id);
  const initialMessage = useMemo<ChatMessage>(
    () => ({
      id: `che-opening-${scene.id}`,
      role: 'che',
      text: getSceneOpeningMessage(scene),
      createdAt: new Date().toISOString(),
    }),
    [scene],
  );

  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);

  useEffect(() => {
    setMessages([initialMessage]);
  }, [initialMessage]);

  const sendMessage = (text: string) => {
    const now = Date.now();
    const userMessage: ChatMessage = {
      id: `user-${now}`,
      role: 'user',
      text,
      createdAt: new Date(now).toISOString(),
    };
    const cheMessage: ChatMessage = {
      id: `che-${now + 1}`,
      role: 'che',
      text: getMockSceneReply(scene, text),
      createdAt: new Date(now + 1).toISOString(),
    };

    setMessages((currentMessages) => [...currentMessages, userMessage, cheMessage]);
  };

  return { agentSceneContext, messages, sendMessage };
}
