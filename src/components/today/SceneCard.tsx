// SceneCard renders one Today activity entry. The whole card is tappable.
// Keep it scene-like and compact; avoid turning it into a task row.
import type { SceneCard as SceneCardType } from '../../types/che';
import { ArrowRightSoftIcon, DumbbellSoftIcon } from '../icons/SoftIcons';

const exerciseImageUrl = new URL('../../../场景图/exercise.png', import.meta.url).href;

interface SceneCardProps {
  card: SceneCardType;
  onSelect: (card: SceneCardType) => void;
}

export function SceneCard({ card, onSelect }: SceneCardProps) {
  return (
    <button className="scene-card" data-scene={card.sceneType} type="button" onClick={() => onSelect(card)}>
      <span className="scene-thumb" aria-hidden="true">
        <img src={exerciseImageUrl} alt="" />
      </span>
      <span className="scene-copy">
        <span className="scene-title-row">
          <span className="scene-title-icon" aria-hidden="true">
            <DumbbellSoftIcon size={18} />
          </span>
          <h3>{card.title}</h3>
        </span>
        <p>{card.description}</p>
        <time>{getSceneCardTag(card)}</time>
      </span>
      <span className="scene-card-action">
        进入
        <ArrowRightSoftIcon size={17} aria-hidden="true" />
      </span>
    </button>
  );
}

function getSceneCardTag(card: SceneCardType) {
  if (card.status === 'active') return '进行中';
  if (card.status === 'completed') return '已完成';
  return card.timeLabel ?? card.timeHint;
}
