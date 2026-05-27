import type { SceneData } from '../types/che';

export function getSceneStatus(scene: SceneData, activeStartedAt: string | null | undefined, now: number): string {
  if (scene.isDeepEntry) return '安静聊聊 · 夜里';
  if (!activeStartedAt) return `${scene.title} · 刚开始`;

  const startedAt = new Date(activeStartedAt).getTime();
  const elapsedMinutes = Math.max(0, Math.floor((now - startedAt) / 60_000));

  if (elapsedMinutes < 1) return `${scene.title} · 刚开始`;
  return `${scene.title} · 已陪你 ${elapsedMinutes} 分钟`;
}
