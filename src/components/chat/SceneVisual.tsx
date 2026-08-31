import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import type { CheCurrentState, SceneData } from '../../types/che';
import { getSceneImage, getWorldSceneImage } from '../../utils/sceneImages';
import { getSceneStatus } from '../../utils/sceneStatus';
import { BackSoftIcon } from '../icons';

interface SceneVisualProps {
  scene: SceneData;
  cheCurrentState: CheCurrentState;
  activeStartedAt?: string | null;
  onBack: () => void;
  onEnd: () => void;
}

export function SceneVisual({ scene, cheCurrentState, activeStartedAt, onBack, onEnd }: SceneVisualProps) {
  const [now, setNow] = useState(() => Date.now());
  const usesCurrentWorldScene = scene.conversationMode !== 'deep'
    && (cheCurrentState.source === 'shared_activity' || cheCurrentState.entrySceneType === scene.id);
  const image = usesCurrentWorldScene
    ? getWorldSceneImage(cheCurrentState.worldScene, cheCurrentState.entrySceneType)
    : getSceneImage(scene.id);
  const sceneImage = usesCurrentWorldScene ? image.sceneImage : scene.sceneImage ?? image.sceneImage;
  const sceneFocus = usesCurrentWorldScene
    ? image.sceneFocus
    : scene.sceneFocus ?? image.sceneFocus ?? scene.focalPoint ?? 'center center';

  useEffect(() => {
    if (!activeStartedAt) return undefined;
    const timerId = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timerId);
  }, [activeStartedAt]);

  return (
    <section
      className="scene-visual"
      data-scene={scene.id}
      data-world-scene={usesCurrentWorldScene ? cheCurrentState.worldScene.sceneKey : undefined}
      data-world-variant={usesCurrentWorldScene ? cheCurrentState.worldScene.sceneVariant : undefined}
      aria-labelledby="scene-chat-title"
      style={
        {
          '--scene-image': `url("${sceneImage}")`,
          '--scene-position': sceneFocus,
        } as CSSProperties
      }
    >
      <header className="scene-chat-header">
        <button className="scene-back-button" type="button" onClick={onBack} aria-label="返回">
          <BackSoftIcon size={22} aria-hidden="true" />
        </button>
        <span id="scene-chat-title">{getSceneStatus(scene, activeStartedAt, now)}</span>
        <button className="scene-end-button" type="button" onClick={onEnd}>
          结束
        </button>
      </header>

      <div className="scene-visual-copy scene-caption">
        <span>{usesCurrentWorldScene ? cheCurrentState.detail : scene.cheStatusHint}</span>
      </div>
    </section>
  );
}
