// SceneVisual renders the full-screen scene image and top controls.
// The end action appears only when an active shared activity is running.
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import type { SceneData, SceneType } from '../../types/che';

interface SceneVisualProps {
  scene: SceneData;
  activeStartedAt?: string | null;
  onBack: () => void;
  onEndActivity?: () => void;
}

const sceneImages: Partial<Record<SceneType, string>> = {
  fitness: new URL('../../../场景图/exercise.png', import.meta.url).href,
  study: new URL('../../../场景图/work.png', import.meta.url).href,
  meal: new URL('../../../场景图/cooking.png', import.meta.url).href,
  watch: new URL('../../../场景图/prime.png', import.meta.url).href,
  idle: new URL('../../../场景图/park.png', import.meta.url).href,
  deep_room: new URL('../../../场景图/prime.png', import.meta.url).href,
};

export function SceneVisual({ scene, activeStartedAt, onBack, onEndActivity }: SceneVisualProps) {
  const [now, setNow] = useState(() => Date.now());
  const imageUrl = sceneImages[scene.id] ?? sceneImages.idle;

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
      style={{ '--scene-image': `url(${imageUrl})` } as CSSProperties}
    >
      <header className="scene-chat-header">
        <button className="scene-back-button" type="button" onClick={onBack} aria-label="返回">
          ←
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

function getSceneStatus(scene: SceneData, activeStartedAt: string | null | undefined, now: number): string {
  if (scene.isDeepEntry) return '安静聊聊 · 夜里';
  if (!activeStartedAt) return `${scene.title} · 刚开始`;

  const startedAt = new Date(activeStartedAt).getTime();
  const elapsedMinutes = Math.max(0, Math.floor((now - startedAt) / 60_000));

  if (elapsedMinutes < 1) return `${scene.title} · 刚开始`;
  return `${scene.title} · 已陪你 ${elapsedMinutes} 分钟`;
}
