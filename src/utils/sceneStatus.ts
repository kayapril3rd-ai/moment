import type { SceneData } from '../types/che';

export function getSceneStatus(scene: SceneData, activeStartedAt: string | null | undefined, now: number): string {
  if (scene.conversationMode === 'deep') return `${scene.title} · 夜里`;
  if (!activeStartedAt) return `${scene.title} · 刚开始`;
  if (!shouldShowElapsedTime(scene.id)) return `${scene.title} · 进行中`;

  const startedAt = new Date(activeStartedAt).getTime();
  const elapsedMinutes = Math.max(0, Math.floor((now - startedAt) / 60_000));

  if (elapsedMinutes < 1) return `${scene.title} · 进行中`;
  return `${scene.title} · 已陪伴 ${elapsedMinutes} 分钟`;
}

function shouldShowElapsedTime(sceneId: SceneData['id']) {
  return sceneId === 'study' || sceneId === 'fitness';
}
