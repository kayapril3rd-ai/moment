import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { CheNotification } from '../../types/che';
import { BellSoftIcon, CloseSoftIcon } from '../icons';

const headerLogoUrl = new URL('../../../场景图/logo.png', import.meta.url).href;

interface AppTopBarProps {
  title?: string;
  notifications?: CheNotification[];
  showNotification?: boolean;
}

const maxEchoLength = 20;

function formatEchoContent(content: string) {
  const trimmed = content.trim();
  if (trimmed.length <= maxEchoLength) return trimmed;
  return `${trimmed.slice(0, maxEchoLength - 1)}…`;
}

export function AppTopBar({
  title = '此刻',
  notifications = [],
  showNotification = false,
}: AppTopBarProps) {
  const [isEchoOpen, setIsEchoOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const hasUnread = notifications.some((item) => !item.isRead && !readIds.has(item.id));

  const toggleEcho = () => {
    const nextOpen = !isEchoOpen;
    setIsEchoOpen(nextOpen);
    if (nextOpen) setReadIds(new Set(notifications.map((item) => item.id)));
  };

  const echoModal = isEchoOpen
    ? createPortal(
        <div className="echo-overlay" role="presentation" onClick={toggleEcho}>
          <section className="echo-modal" role="dialog" aria-modal="true" aria-label="回响" onClick={(event) => event.stopPropagation()}>
            <header>
              <div className="echo-title-block">
                <h2 className="echo-title">回响</h2>
                <p className="echo-subtitle">澈留给你的几句话</p>
              </div>
              <button type="button" aria-label="关闭回响" onClick={toggleEcho}>
                <CloseSoftIcon size={20} aria-hidden="true" />
              </button>
            </header>
            <div className="echo-list">
              {notifications.length > 0 ? notifications.map((item) => <p className="echo-item" key={item.id}>{formatEchoContent(item.content)}</p>) : <p className="echo-item">暂时没有新消息。</p>}
            </div>
          </section>
        </div>,
        document.body,
      )
    : null;

  return (
    <header className="app-top-bar">
      <div className="brand-row">
        <span className="brand-lockup">
          <img className="header-logo-image" src={headerLogoUrl} alt="" aria-hidden="true" />
          <strong>{title}</strong>
        </span>
        {showNotification ? (
          <button className={`notification-button${hasUnread ? ' has-unread' : ''}`} type="button" aria-label="回响" onClick={toggleEcho}>
            <BellSoftIcon size={24} aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {echoModal}

    </header>
  );
}
