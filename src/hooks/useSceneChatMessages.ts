import { useEffect, useMemo, useState } from 'react';
import type { ChatMessage, CheCurrentState, SceneData } from '../types/che';
import { buildChatRuntimeContext } from '../utils/agentSceneContext';
import { getMockSceneReply, getSceneOpeningMessage } from '../utils/reply';

export function useSceneChatMessages(scene: SceneData, cheCurrentState: CheCurrentState) {
  const chatRuntimeContext = useMemo(
    () => buildChatRuntimeContext(scene, cheCurrentState),
    [cheCurrentState, scene],
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createInitialMessage(scene)]);

  useEffect(() => {
    setMessages([createInitialMessage(scene)]);
  }, [scene.id]);

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

  return { chatRuntimeContext, messages, sendMessage };
}

function createInitialMessage(scene: SceneData): ChatMessage {
  return {
    id: `che-opening-${scene.id}`,
    role: 'che',
    text: getSceneOpeningMessage(scene),
    createdAt: new Date().toISOString(),
  };
}
