// HeroStatusCard shows where Che is right now, as a lived-in scene entry.
// Change copy in src/data/mockCheStatus.ts; change the scene image reference here if the hero scene changes.
import type { CSSProperties } from 'react';
import type { CheStatus, TodayCopy } from '../../types/che';

const heroImageUrl = new URL('../../../场景图/work.png', import.meta.url).href;

interface HeroStatusCardProps {
  status: CheStatus;
  copy: TodayCopy;
  actionLabel?: string;
  onOpenScene: () => void;
}

export function HeroStatusCard({ status, copy, actionLabel, onOpenScene }: HeroStatusCardProps) {
  return (
    <section
      className="hero-card"
      aria-labelledby="hero-status-title"
      style={{ '--hero-image': `url(${heroImageUrl})` } as CSSProperties}
    >
      <div className="hero-visual" aria-hidden="true" />
      <div className="hero-content">
        <p className="hero-status-line">{status.period} · {status.location}</p>
        <h2 id="hero-status-title">{status.currentActivity}</h2>
        <p className="hero-detail">{status.detail}</p>
      </div>
      <button className="primary-button" type="button" onClick={onOpenScene}>
        {actionLabel ?? copy.heroActionLabel}
      </button>
    </section>
  );
}
