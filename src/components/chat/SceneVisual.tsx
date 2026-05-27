// SceneVisual renders the full-screen scene image and top controls.
// Background image is always resolved from scene.id, so each event keeps its own scene.
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import type { SceneData } from '../../types/che';
import { getSceneImage } from '../../utils/sceneImages';
import { getSceneStatus } from '../../utils/sceneStatus';
import { BackIcon } from '../icons';

interface SceneVisualProps {
  scene: SceneData;
  activeStartedAt?: string | null;
  onBack: () => void;
  onEndActivity?: () => void;
}

export function SceneVisual({ scene, activeStartedAt, onBack, onEndActivity }: SceneVisualProps) {
  const [now, setNow] = useState(() => Date.now());
  const image = getSceneImage(scene.id);

  useEffect(() => {
    if (!activeStartedAt) return undefined;
    const timerId = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timerId);
  }, [activeStartedAt]);

  return (
    <section
      className="scene-visual"
      data-scene={scene.id}
      aria-labelledby="scene-chat-title"
      style={
        {
          '--scene-image': `url(${image.src})`,
          '--scene-position': image.heroFocus ?? scene.focalPoint ?? 'center center',
        } as CSSProperties
      }
    >
      <header className="scene-chat-header">
        <button className="scene-back-button" type="button" onClick={onBack} aria-label="返回">
          <BackIcon size={25} aria-hidden="true" />
        </button>
        <span>{getSceneStatus(scene, activeStartedAt, now)}</span>
        {onEndActivity ? (
          <button className="scene-end-button" type="button" onClick={onEndActivity}>
            结束这次
          </button>
        ) : null}
      </header>

      <div className="scene-visual-copy">
        <p>{scene.isDeepEntry ? 'Deep Room' : scene.shortTitle}</p>
        <h1 id="scene-chat-title">{scene.title}</h1>
        <span>{scene.cheStatusHint}</span>
      </div>
    </section>
  );
}
