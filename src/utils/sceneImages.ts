import type { SceneType } from '../types/che';

export type SceneImageConfig = {
  src: string;
  heroSrc: string;
  cardSrc: string;
  arrangeSrc: string;
  thumbFocus: string;
  heroFocus: string;
  arrangeFocus: string;
  needsCardCrop?: boolean;
};

const todayWork = new URL('../../场景图/今天/work.png', import.meta.url).href;
const todayExercise = new URL('../../场景图/今天/exercise.png', import.meta.url).href;
const todayCooking = new URL('../../场景图/今天/cooking.png', import.meta.url).href;
const todayPark = new URL('../../场景图/今天/park.png', import.meta.url).href;
const todaySofa = new URL('../../场景图/今天/sofa.png', import.meta.url).href;
const todayDeep = new URL('../../场景图/今天/deep.png', import.meta.url).href;
const todaySea = new URL('../../场景图/今天/sea.png', import.meta.url).href;

const arrangeWork = new URL('../../场景图/安排/work.png', import.meta.url).href;
const arrangeExercise = new URL('../../场景图/安排/exercise.png', import.meta.url).href;
const arrangeCooking = new URL('../../场景图/安排/cooking.png', import.meta.url).href;
const arrangePark = new URL('../../场景图/安排/park2.png', import.meta.url).href;
const arrangeSofa = new URL('../../场景图/安排/sofa.png', import.meta.url).href;
const arrangeDeep = new URL('../../场景图/安排/deep.png', import.meta.url).href;
const arrangeSea = new URL('../../场景图/安排/sea.png', import.meta.url).href;

export const sceneImageConfig: Record<SceneType, SceneImageConfig> = {
  study: {
    src: todayWork,
    heroSrc: todayWork,
    cardSrc: todayWork,
    arrangeSrc: arrangeWork,
    thumbFocus: '64% 34%',
    heroFocus: '58% 32%',
    arrangeFocus: '60% 32%',
  },
  fitness: {
    src: todayExercise,
    heroSrc: todayExercise,
    cardSrc: todayExercise,
    arrangeSrc: arrangeExercise,
    thumbFocus: '58% 28%',
    heroFocus: '54% 28%',
    arrangeFocus: '50% 28%',
  },
  meal: {
    src: todayCooking,
    heroSrc: todayCooking,
    cardSrc: todayCooking,
    arrangeSrc: arrangeCooking,
    thumbFocus: '52% 35%',
    heroFocus: '50% 34%',
    arrangeFocus: '62% 35%',
  },
  watch: {
    src: todaySofa,
    heroSrc: todaySofa,
    cardSrc: todaySofa,
    arrangeSrc: arrangeSofa,
    thumbFocus: '56% 36%',
    heroFocus: '52% 38%',
    arrangeFocus: '58% 34%',
  },
  idle: {
    src: todayPark,
    heroSrc: todayPark,
    cardSrc: todayPark,
    arrangeSrc: arrangePark,
    thumbFocus: '58% 32%',
    heroFocus: '56% 34%',
    arrangeFocus: '55% 30%',
  },
  deep_room: {
    src: todayDeep,
    heroSrc: todayDeep,
    cardSrc: todayDeep,
    arrangeSrc: arrangeDeep,
    thumbFocus: '50% 38%',
    heroFocus: '50% 38%',
    arrangeFocus: '52% 35%',
  },
  sleep: {
    src: todaySofa,
    heroSrc: todaySofa,
    cardSrc: todaySofa,
    arrangeSrc: arrangeSofa,
    thumbFocus: '52% 42%',
    heroFocus: '52% 40%',
    arrangeFocus: '58% 34%',
  },
  gaming: {
    src: todaySofa,
    heroSrc: todaySofa,
    cardSrc: todaySofa,
    arrangeSrc: arrangeSofa,
    thumbFocus: '52% 42%',
    heroFocus: '52% 40%',
    arrangeFocus: '58% 34%',
    needsCardCrop: true,
  },
  commute: {
    src: todaySea,
    heroSrc: todaySea,
    cardSrc: todaySea,
    arrangeSrc: arrangeSea,
    thumbFocus: '58% 32%',
    heroFocus: '56% 34%',
    arrangeFocus: '55% 32%',
  },
};

export function getSceneImage(sceneType: SceneType | null | undefined): SceneImageConfig {
  return sceneImageConfig[sceneType ?? 'idle'] ?? sceneImageConfig.idle;
}

export function getScenesNeedingCardCrop(): SceneType[] {
  return Object.entries(sceneImageConfig)
    .filter(([, config]) => config.needsCardCrop)
    .map(([sceneType]) => sceneType as SceneType);
}
