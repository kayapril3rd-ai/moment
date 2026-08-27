import type { CSSProperties } from 'react';
import type { CheCurrentState } from '../../types/che';
import { getWorldSceneImage } from '../../utils/sceneImages';

interface HeroStatusCardProps {
  state: CheCurrentState;
  now: number;
  onOpenScene?: () => void;
}

export function HeroStatusCard({ state, now, onOpenScene }: HeroStatusCardProps) {
  const sceneImage = getWorldSceneImage(state.worldScene, state.entrySceneType);
  const actionLabel = state.source === 'shared_activity' ? '回到场景' : '去找他';

  return (
    <section className="hero-card" aria-labelledby="hero-status-title" style={{ '--hero-image': `url(${sceneImage.heroImage})`, '--hero-position': sceneImage.heroFocus } as CSSProperties}>
      <div className="hero-visual" aria-hidden="true" />
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-content">
        <p className="hero-status-line">{getDayPeriod(now)} · {state.location}</p>
        <div className="hero-copy">
          <h2 id="hero-status-title" className="hero-title">{state.activity}</h2>
          <span className="hero-divider" aria-hidden="true" />
          <p className="hero-detail hero-desc">{state.detail}</p>
        </div>
      </div>
      {onOpenScene ? <button className="primary-button hero-action" type="button" onClick={onOpenScene}>{actionLabel}</button> : null}
    </section>
  );
}

function getDayPeriod(now: number) {
  const hour = new Date(now).getHours();
  if (hour >= 5 && hour < 9) return '早上';
  if (hour >= 9 && hour < 12) return '上午';
  if (hour >= 12 && hour < 18) return '下午';
  if (hour >= 18 && hour < 23) return '晚上';
  return '夜里';
}
