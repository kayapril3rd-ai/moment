import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import type { SceneData } from '../../types/che';
import { getSceneImage } from '../../utils/sceneImages';
import { getSceneStatus } from '../../utils/sceneStatus';
import { BackSoftIcon } from '../icons';

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
          '--scene-image': `url("${scene.sceneImage ?? image.sceneImage}")`,
          '--scene-position': scene.sceneFocus ?? image.sceneFocus ?? scene.focalPoint ?? 'center center',
        } as CSSProperties
      }
    >
      <header className="scene-chat-header">
        <button className="scene-back-button" type="button" onClick={onBack} aria-label="返回">
          <BackSoftIcon size={22} aria-hidden="true" />
        </button>
        <span id="scene-chat-title">{getSceneStatus(scene, activeStartedAt, now)}</span>
        <button className="scene-end-button" type="button" onClick={onEndActivity ?? onBack}>
          结束
        </button>
      </header>

      <div className="scene-visual-copy scene-caption">
        <span>{scene.cheStatusHint}</span>
      </div>
    </section>
  );
}
