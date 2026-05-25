// SceneChat shows the scene first. Chat opens only after the round launcher is tapped.
import { useEffect, useMemo, useState } from 'react';
import type { ChatMessage, SceneData } from '../../types/che';
import { getMockSceneReply, getSceneOpeningMessage } from '../../utils/reply';
import { ChatPanel } from './ChatPanel';
import { SceneVisual } from './SceneVisual';

interface SceneChatProps {
  scene: SceneData;
  activeStartedAt?: string | null;
  onBack: () => void;
  onOpenDeep: () => void;
  onEndActivity?: () => void;
}

export function SceneChat({ scene, activeStartedAt, onBack, onEndActivity }: SceneChatProps) {
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
  const [isChatOpen, setIsChatOpen] = useState(scene.isDeepEntry);

  useEffect(() => {
    setMessages([initialMessage]);
    setIsChatOpen(scene.isDeepEntry);
  }, [initialMessage, scene.isDeepEntry]);

  const handleSend = (text: string) => {
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
      text: getMockSceneReply(scene.id, text),
      createdAt: new Date(now + 1).toISOString(),
    };
    setMessages((currentMessages) => [...currentMessages, userMessage, cheMessage]);
  };

  return (
    <main className="app-shell chat-shell" aria-labelledby="scene-chat-title">
      <div className={`phone-frame chat-frame${isChatOpen ? ' is-chat-open' : ''}`}>
        <SceneVisual scene={scene} activeStartedAt={activeStartedAt} onBack={onBack} onEndActivity={onEndActivity} />
        {!isChatOpen ? (
          <div className="chat-launcher">
            <button className="chat-launcher-button" type="button" aria-label="打开聊天" onClick={() => setIsChatOpen(true)}>
              <span aria-hidden="true" />
            </button>
            <p>点一下，和澈聊聊吧</p>
          </div>
        ) : (
          <ChatPanel scene={scene} messages={messages} onSend={handleSend} />
        )}
      </div>
    </main>
  );
}
