import { useEffect, useState } from 'react';
import type { CheCurrentState, SceneData } from '../../types/che';
import type { ChatUserContext } from '../../types/chat';
import { useSceneChatMessages } from '../../hooks/useSceneChatMessages';
import type { StoredChatSession } from '../../utils/chatStorage';
import { ChatSoftIcon } from '../icons';
import { ChatPanel } from './ChatPanel';
import { SceneVisual } from './SceneVisual';

interface SceneChatProps {
  scene: SceneData;
  cheCurrentState: CheCurrentState;
  userContext: ChatUserContext;
  activeStartedAt?: string | null;
  onBack: () => void;
  onEnd: (session: StoredChatSession) => void;
}

export function SceneChat({ scene, cheCurrentState, userContext, activeStartedAt, onBack, onEnd }: SceneChatProps) {
  const {
    chatRuntimeContext,
    endSession,
    error,
    isSending,
    messages,
    retryLastMessage,
    sendMessage,
  } = useSceneChatMessages(scene, cheCurrentState, userContext);
  const isDeep = scene.conversationMode === 'deep';
  const [isChatOpen, setIsChatOpen] = useState(isDeep);

  useEffect(() => {
    setIsChatOpen(isDeep);
  }, [scene.id, isDeep]);

  useEffect(() => {
    if (!isChatOpen) return undefined;
    window.history.pushState({ sceneChat: 'chat_open' }, '');
    const handlePopState = () => setIsChatOpen(false);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isChatOpen]);

  const handleEnd = () => {
    const endedSession = endSession();
    setIsChatOpen(false);
    onEnd(endedSession);
  };

  return (
    <main
      className="app-shell chat-shell"
      aria-labelledby="scene-chat-title"
      data-agent-scene={chatRuntimeContext.sceneKey}
      data-scene-variant={chatRuntimeContext.sceneVariant}
      data-chat-mode={chatRuntimeContext.chatMode}
    >
      <div className={`phone-frame chat-frame${isChatOpen ? ' is-chat-open' : ''}`}>
        <div onClick={() => isChatOpen && setIsChatOpen(false)}>
          <SceneVisual scene={scene} cheCurrentState={cheCurrentState} activeStartedAt={activeStartedAt} onBack={onBack} onEnd={handleEnd} />
        </div>
        {!isChatOpen ? (
          <div className="chat-launcher">
            <button className="chat-launcher-button" type="button" aria-label="打开聊天" onClick={() => setIsChatOpen(true)}>
              <ChatSoftIcon className="scene-chat-launcher-glyph" size={24} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div onClick={(event) => event.stopPropagation()}>
            <ChatPanel
              scene={scene}
              messages={messages}
              isSending={isSending}
              error={error}
              onSend={sendMessage}
              onRetry={retryLastMessage}
              onCollapse={() => setIsChatOpen(false)}
            />
          </div>
        )}
      </div>
    </main>
  );
}
