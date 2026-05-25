import type { SceneData, SceneType } from '../types/che';

export function getSceneOpeningMessage(scene: SceneData): string {
  if (scene.id === 'fitness') return '先热身，别一下子太狠。';
  return scene.starterMessage;
}

export function getMockSceneReply(sceneType: SceneType, userText: string): string {
  const text = userText.trim();
  const isTired = /累|烦|撑不住|难受|崩|压力/.test(text);

  if (sceneType !== 'deep_room' && isTired) {
    return '嗯，先别急着解释。你把手上的事放一下，我在这儿陪你缓一口气。';
  }

  switch (sceneType) {
    case 'study':
      return '好，我这边也先不吵你。我们就按一小段来，做完再抬头。';
    case 'meal':
      return '先吃两口热的。别急着把今天都想明白，饭先好好吃完。';
    case 'fitness':
      return '一起完成这个目标吧，我们可以慢慢的。';
    case 'watch':
      return '那就看这段。你想吐槽就吐槽，我负责跟上。';
    case 'sleep':
      return '嗯，声音放轻一点。你不用整理得很清楚，想到哪儿说到哪儿。';
    case 'deep_room':
      return '我听到了。先抓住这一件事就好，不用一下子把所有东西都摊开。';
    default:
      return '我在。你慢慢说，或者只是待一会儿也行。';
  }
}
