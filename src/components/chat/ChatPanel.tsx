import { FormEvent, useEffect, useRef, useState } from 'react';
import type { ChatMessage, SceneData } from '../../types/che';
import { SendSoftIcon } from '../icons';

interface ChatPanelProps {
  scene: SceneData;
  messages: ChatMessage[];
  isSending: boolean;
  error: string | null;
  onSend: (text: string) => Promise<void>;
  onRetry: () => Promise<void>;
  onCollapse?: () => void;
}

export function ChatPanel({ scene, messages, isSending, error, onSend, onRetry, onCollapse }: ChatPanelProps) {
  const [draft, setDraft] = useState('');
  const isDeep = scene.conversationMode === 'deep';
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) messageList.scrollTop = messageList.scrollHeight;
  }, [error, isSending, messages]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isSending) return;
    void onSend(text);
    setDraft('');
  };

  return (
    <section className="chat-panel" aria-label="聊天">
      <button className="chat-panel-handle" type="button" aria-label="收起聊天" onClick={onCollapse} />
      <div className="chat-message-list" ref={messageListRef}>
        {messages.map((message) => (
          <div className={`chat-message is-${message.role}`} key={message.id}>
            <p>{message.text}</p>
          </div>
        ))}
        {isSending ? <p className="chat-runtime-waiting" role="status">澈正在回复…</p> : null}
        {error ? (
          <div className="chat-runtime-error" role="alert">
            <span>{error}</span>
            <button type="button" disabled={isSending} onClick={() => void onRetry()}>重试</button>
          </div>
        ) : null}
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
          <button type="submit" aria-label="发送" disabled={isSending || !draft.trim()}>
            <SendSoftIcon size={20} aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  );
}
