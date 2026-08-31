// TogetherMoments 是“时光记录”的占位页。
// 后续可以扩展为共同活动摘要、轻量聊天摘要和澈记得的小事。
import type { RecentMoment } from '../../types/che';
import { formatMomentTime } from '../../utils/date';
import { BackSoftIcon } from '../icons';

interface TogetherMomentsProps {
  moments: RecentMoment[];
  onBack: () => void;
}

export function TogetherMoments({ moments, onBack }: TogetherMomentsProps) {
  const now = Date.now();
  return (
    <main className="app-shell" aria-labelledby="moments-page-title">
      <div className="phone-frame moments-frame">
        <header className="moments-page-header">
          <button className="moments-back-button" type="button" onClick={onBack} aria-label="返回 Today">
            <BackSoftIcon size={22} aria-hidden="true" />
          </button>
          <div>
            <p>这些天</p>
            <h1 id="moments-page-title">时光记录</h1>
          </div>
        </header>

        <p className="moments-intro">
          这里会放你们一起做过的事、轻量聊天摘要，和澈记得的小事。
        </p>

        <div className="moments-page-list">
          {moments.length > 0 ? moments.map((moment) => (
              <article className="moment-card" key={moment.id}>
                <time dateTime={moment.createdAt}>{formatMomentTime(moment.createdAt, now)}</time>
                <p>{moment.text}</p>
              </article>
            )) : <p className="moments-empty">还没有留下记录。</p>}
        </div>
      </div>
    </main>
  );
}
