// ChatPanel is only rendered after the scene chat launcher is tapped.
// No avatars are used; bubbles carry the conversation.
import { FormEvent, useState } from 'react';
import type { ChatMessage, SceneData } from '../../types/che';
import { SendIcon } from '../icons';

interface ChatPanelProps {
  scene: SceneData;
  messages: ChatMessage[];
  onSend: (text: string) => void;
}

export function ChatPanel({ scene, messages, onSend }: ChatPanelProps) {
  const [draft, setDraft] = useState('');
  const isDeep = scene.isDeepEntry;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();

    if (!text) return;

    onSend(text);
    setDraft('');
  };

  return (
    <section className="chat-panel" aria-label={`${scene.title}聊天`}>
      <div className="chat-panel-handle" aria-hidden="true" />
      <div className="chat-message-list">
        {messages.map((message) => (
          <div className={`chat-message is-${message.role}`} key={message.id}>
            <p>{message.text}</p>
          </div>
        ))}
      </div>

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
          <SendIcon size={20} aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
