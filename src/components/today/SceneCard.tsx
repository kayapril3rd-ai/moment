// SceneCard renders one Today activity entry. The whole card is tappable.
// The thumbnail follows the card scene and uses thumbFocus to preserve faces.
import type { CSSProperties } from 'react';
import type { SceneCard as SceneCardType } from '../../types/che';
import { getSceneImage } from '../../utils/sceneImages';
import { FitnessIcon, MovieIcon, ParkIcon, StudyIcon } from '../icons';

interface SceneCardProps {
  card: SceneCardType;
  onSelect: (card: SceneCardType) => void;
}

export function SceneCard({ card, onSelect }: SceneCardProps) {
  const image = getSceneImage(card.sceneType);

  return (
    <button className="scene-card" data-scene={card.sceneType} type="button" onClick={() => onSelect(card)}>
      <span className="scene-thumb" aria-hidden="true">
        <img src={image.src} alt="" style={{ objectPosition: image.thumbFocus } as CSSProperties} />
      </span>
      <span className="scene-copy">
        <span className="scene-title-row">
          <span className="scene-title-icon" aria-hidden="true">
            <SceneIcon sceneType={card.sceneType} />
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

function SceneIcon({ sceneType }: { sceneType: SceneCardType['sceneType'] }) {
  if (sceneType === 'fitness') return <FitnessIcon size={24} />;
  if (sceneType === 'study') return <StudyIcon size={24} />;
  if (sceneType === 'watch') return <MovieIcon size={24} />;
  return <ParkIcon size={24} />;
}

function getSceneCardTag(card: SceneCardType) {
  if (card.status === 'active') return '进行中';
  if (card.status === 'completed') return '已完成';
  return card.timeLabel ?? card.timeHint;
}
