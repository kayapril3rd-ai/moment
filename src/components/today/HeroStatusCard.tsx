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
  const heroTitle = getHeroTitle(status);
  const heroDescription = getHeroDescription(status.detail);

  return (
    <section
      className="hero-card"
      aria-labelledby="hero-status-title"
      style={
        {
          '--hero-image': `url(${sceneImage.heroImage})`,
          '--hero-position': sceneImage.heroFocus,
        } as CSSProperties
      }
    >
      <div className="hero-visual" aria-hidden="true" />
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-content">
        <p className="hero-status-line">{status.period} · {status.location}</p>
        <div className="hero-copy">
          <h2 id="hero-status-title" className="hero-title">{heroTitle}</h2>
          <span className="hero-divider" aria-hidden="true" />
          <p className="hero-detail hero-desc">{heroDescription}</p>
        </div>
      </div>
      <button className="primary-button hero-action" type="button" onClick={onOpenScene}>
        {actionLabel ?? copy.heroActionLabel}
      </button>
    </section>
  );
}

function getHeroTitle(status: CheStatus) {
  if (status.location.includes('窗')) return '窗边小坐';
  if (status.availableScenes[0] === 'meal') return '好好吃饭';
  if (status.availableScenes[0] === 'fitness') return '一起动一动';
  if (status.availableScenes[0] === 'watch') return '客厅小坐';
  if (status.availableScenes[0] === 'deep_room') return '夜里慢谈';
  return compactText(status.currentActivity, 6);
}

function getHeroDescription(detail: string) {
  const normalized = detail.replace(/\s+/g, ' ').trim();
  if (normalized.includes('咖啡') && normalized.includes('窗边')) return '咖啡还剩半杯，窗边阳光洒下。';
  return compactText(normalized.split(/[。！？]/)[0] || normalized, 18);
}

function compactText(text: string, maxLength: number) {
  const value = text.trim();
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
}
