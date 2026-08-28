import type { CSSProperties } from 'react';
import type { CheScheduleItem } from '../../types/che';
import { getWorldSceneImage } from '../../utils/sceneImages';

interface CheScheduleListProps {
  schedule: CheScheduleItem[];
}

export function CheScheduleList({ schedule }: CheScheduleListProps) {
  return (
    <div className="che-scene-list" aria-label="澈的安排">
      {schedule.map((item) => {
        const image = getWorldSceneImage(item.worldScene, item.sceneType);
        const action = item.actionLabel?.trim();
        const statusText = getStatusText(item);

        return (
          <article
            className="che-scene-card"
            key={item.id}
            style={{ '--image-position': item.cardFocus ?? image.arrangeFocus } as CSSProperties}
          >
            <img className="scene-card-image" src={item.cardImage ?? image.arrangeSrc} alt="" />
            <span className="scene-card-overlay" aria-hidden="true" />
            <div className="che-scene-content">
              <span className="che-scene-copy">
                <small>{item.timeLabel || item.startTime}</small>
                <strong>{item.title}</strong>
              </span>
            </div>
            {statusText ? <span className="che-schedule-completed">{statusText}</span> : null}
            {action ? (
              <button className="che-scene-action" type="button">
                {action}
              </button>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function getStatusText(item: CheScheduleItem): string {
  return item.status === 'completed' ? '已完成' : '';
}
