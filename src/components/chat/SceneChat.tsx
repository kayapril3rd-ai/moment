import { useEffect, useState } from 'react';
import type { CheCurrentState, SceneData } from '../../types/che';
import { useSceneChatMessages } from '../../hooks/useSceneChatMessages';
import { ChatSoftIcon } from '../icons';
import { ChatPanel } from './ChatPanel';
import { SceneVisual } from './SceneVisual';

interface SceneChatProps {
  scene: SceneData;
  cheCurrentState: CheCurrentState;
  activeStartedAt?: string | null;
  onBack: () => void;
  onEndActivity?: (hasChat?: boolean) => void;
}

export function SceneChat({ scene, cheCurrentState, activeStartedAt, onBack, onEndActivity }: SceneChatProps) {
  const { chatRuntimeContext, messages, sendMessage } = useSceneChatMessages(scene, cheCurrentState);
  const isDeep = scene.conversationMode === 'deep';
  const [isChatOpen, setIsChatOpen] = useState(isDeep);

  useEffect(() => {
    setIsChatOpen(isDeep);
  }, [scene.id, isDeep]);

  useEffect(() => {
    if (!isChatOpen || isDeep) return undefined;
    window.history.pushState({ sceneChat: 'chat_open' }, '');
    const handlePopState = () => setIsChatOpen(false);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isChatOpen, isDeep]);

  const handleEndActivity = onEndActivity
    ? () => {
        const hasChat = messages.some((message) => message.role === 'user');
        setIsChatOpen(false);
        onEndActivity(hasChat);
      }
    : undefined;

  return (
    <main
      className="app-shell chat-shell"
      aria-labelledby="scene-chat-title"
      data-agent-scene={chatRuntimeContext.sceneKey}
      data-scene-variant={chatRuntimeContext.sceneVariant}
      data-chat-mode={chatRuntimeContext.chatMode}
    >
      <div className={`phone-frame chat-frame${isChatOpen ? ' is-chat-open' : ''}`}>
        <div onClick={() => isChatOpen && !isDeep && setIsChatOpen(false)}>
          <SceneVisual scene={scene} activeStartedAt={activeStartedAt} onBack={onBack} onEndActivity={handleEndActivity} />
        </div>
        {!isChatOpen ? (
          <div className="chat-launcher">
            <button className="chat-launcher-button" type="button" aria-label="打开聊天" onClick={() => setIsChatOpen(true)}>
              <ChatSoftIcon size={28} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div onClick={(event) => event.stopPropagation()}>
            <ChatPanel scene={scene} messages={messages} onSend={sendMessage} onCollapse={() => setIsChatOpen(false)} />
          </div>
        )}
      </div>
    </main>
  );
}
