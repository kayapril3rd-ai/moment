// SceneChat shows the scene first. Chat opens only after the round launcher is tapped.
import { useEffect, useState } from 'react';
import type { SceneData } from '../../types/che';
import { useSceneChatMessages } from '../../hooks/useSceneChatMessages';
import { ChatIcon } from '../icons';
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
  const { messages, sendMessage } = useSceneChatMessages(scene);
  const [isChatOpen, setIsChatOpen] = useState(scene.isDeepEntry);

  useEffect(() => {
    setIsChatOpen(scene.isDeepEntry);
  }, [scene.isDeepEntry]);

  return (
    <main className="app-shell chat-shell" aria-labelledby="scene-chat-title">
      <div className={`phone-frame chat-frame${isChatOpen ? ' is-chat-open' : ''}`}>
        <SceneVisual scene={scene} activeStartedAt={activeStartedAt} onBack={onBack} onEndActivity={onEndActivity} />
        {!isChatOpen ? (
          <div className="chat-launcher">
            <button className="chat-launcher-button" type="button" aria-label="打开聊天" onClick={() => setIsChatOpen(true)}>
              <ChatIcon size={29} aria-hidden="true" />
            </button>
            <p>点一下，和澈聊聊吧</p>
          </div>
        ) : (
          <ChatPanel scene={scene} messages={messages} onSend={sendMessage} />
        )}
      </div>
    </main>
  );
}
