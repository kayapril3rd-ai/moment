// HeroStatusCard shows where Che is right now, as a lived-in scene entry.
// The scene image follows the current event through CheStatus.availableScenes[0].
import type { CSSProperties } from 'react';
import type { CheStatus, TodayCopy } from '../../types/che';
import { getSceneImage } from '../../utils/sceneImages';

interface HeroStatusCardProps {
  status: CheStatus;
  copy: TodayCopy;
  actionLabel?: string;
  onOpenScene: () => void;
}

export function HeroStatusCard({ status, copy, actionLabel, onOpenScene }: HeroStatusCardProps) {
  const sceneImage = getSceneImage(status.availableScenes[0]);

  return (
    <section
      className="hero-card"
      aria-labelledby="hero-status-title"
      style={
        {
          '--hero-image': `url(${sceneImage.src})`,
          '--hero-position': sceneImage.heroFocus,
        } as CSSProperties
      }
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
