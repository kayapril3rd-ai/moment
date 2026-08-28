import type { SceneData } from '../types/che';

export function getSceneOpeningMessage(scene: SceneData): string {
  if (scene.id === 'fitness') return '先热身，别一下子太狠。';
  return scene.starterMessage;
}
