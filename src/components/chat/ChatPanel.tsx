import { FormEvent, useState } from 'react';
import type { ChatMessage, SceneData } from '../../types/che';
import { SendSoftIcon } from '../icons';

interface ChatPanelProps {
  scene: SceneData;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onCollapse?: () => void;
}

export function ChatPanel({ scene, messages, onSend, onCollapse }: ChatPanelProps) {
  const [draft, setDraft] = useState('');
  const isDeep = scene.conversationMode === 'deep';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  };

  return (
    <section className="chat-panel" aria-label="聊天">
      <button className="chat-panel-handle" type="button" aria-label="收起聊天" onClick={onCollapse} />
      <div className="chat-message-list">
        {messages.map((message) => (
          <div className={`chat-message is-${message.role}`} key={message.id}>
            <p>{message.text}</p>
          </div>
        ))}
      </div>

      <div className="chat-input-wrap">
        <form className="chat-input-row" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="scene-chat-input">{isDeep ? '慢慢说也可以' : '和他说点什么'}</label>
          <input
            id="scene-chat-input"
            type="text"
            placeholder={isDeep ? '慢慢说也可以' : '和他说点什么...'}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button type="submit" aria-label="发送">
            <SendSoftIcon size={20} aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  );
}
