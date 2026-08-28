// QuietChatEntry is the low-pressure quiet-chat entrance below the hero.
// It should feel like "come sit for a while", not a therapy or tool module.
import { ArrowRightSoftIcon } from '../icons';

const deepTalkCatIconUrl = new URL('../../assets/deep-talk-cat-cropped.png', import.meta.url).href;

interface QuietChatEntryProps {
  onOpen: () => void;
}

export function QuietChatEntry({ onOpen }: QuietChatEntryProps) {
  return (
    <button className="quiet-chat-entry" type="button" onClick={onOpen}>
      <span className="quiet-icon" aria-hidden="true">
        <img className="deep-talk-cat-icon" src={deepTalkCatIconUrl} alt="" />
      </span>
      <span className="quiet-copy">
        <span className="quiet-title-row">
          <strong>安静聊聊</strong>
        </span>
        <em>如果今天有点满，可以来这里慢慢说。</em>
      </span>
      <span className="quiet-chat-arrow">
        进入
        <ArrowRightSoftIcon size={18} aria-hidden="true" />
      </span>
    </button>
  );
}
