import type { CSSProperties } from 'react';
import type { CheCurrentState } from '../../types/che';
import { getWorldSceneImage } from '../../utils/sceneImages';
import { ArrowRightSoftIcon } from '../icons';

interface HeroStatusCardProps {
  state: CheCurrentState;
  onOpenScene?: () => void;
}

export function HeroStatusCard({ state, onOpenScene }: HeroStatusCardProps) {
  const sceneImage = getWorldSceneImage(state.worldScene, state.entrySceneType);
  const actionLabel = state.source === 'shared_activity' ? '回到场景' : '去找他';

  return (
    <section className="hero-card" aria-labelledby="hero-status-title" style={{ '--hero-image': `url(${sceneImage.heroImage})`, '--hero-position': sceneImage.heroFocus } as CSSProperties}>
      <div className="hero-visual" aria-hidden="true" />
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-content">
        <p className="hero-status-line">{state.location}</p>
        <div className="hero-copy">
          <h2 id="hero-status-title" className="hero-title">{state.activity}</h2>
          <span className="hero-divider" aria-hidden="true" />
          <p className="hero-detail hero-desc">{state.detail}</p>
        </div>
      </div>
      {onOpenScene ? (
        <button className="primary-button hero-action" type="button" onClick={onOpenScene}>
          <span>{actionLabel}</span>
          <ArrowRightSoftIcon size={18} aria-hidden="true" />
        </button>
      ) : null}
    </section>
  );
}
