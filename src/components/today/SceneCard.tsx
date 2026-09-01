// SceneCard renders one Today activity entry. The whole card is tappable.
// The thumbnail follows the card scene and uses cardFocus to preserve faces.
import type { CSSProperties } from 'react';
import type { SceneCard as SceneCardType } from '../../types/che';
import { getSceneCardImage } from '../../utils/sceneImages';
import { ActivityIcon } from '../icons';

interface SceneCardProps {
  card: SceneCardType;
  onSelect: (card: SceneCardType) => void;
}

export function SceneCard({ card, onSelect }: SceneCardProps) {
  const image = getSceneCardImage(card.sceneType, card.worldSceneOverride);

  return (
    <button className="scene-card" data-scene={card.sceneType} type="button" onClick={() => onSelect(card)}>
      <span className="scene-thumb" aria-hidden="true">
        <img src={image.cardImage} alt="" style={{ objectPosition: image.cardFocus } as CSSProperties} />
      </span>
      <span className="scene-copy">
        <span className="scene-title-row">
          <span className="scene-title-icon" aria-hidden="true">
            <ActivityIcon sceneType={card.sceneType} worldScene={card.worldSceneOverride} size={22} />
          </span>
          <h3>{card.title}</h3>
        </span>
        <p>{card.description}</p>
        <time>{getSceneCardTag(card)}</time>
      </span>
      <span className="scene-card-action">进入</span>
    </button>
  );
}

function getSceneCardTag(card: SceneCardType) {
  if (card.status === 'active') return '进行中';
  if (card.status === 'completed') return '已完成';
  return card.timeLabel ?? card.timeHint;
}
