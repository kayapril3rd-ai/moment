import type { SceneType } from '../types/che';

export type SceneImageConfig = {
  cardImage: string;
  heroImage: string;
  sceneImage: string;
  src: string;
  heroSrc: string;
  cardSrc: string;
  arrangeSrc: string;
  cardFocus: string;
  thumbFocus: string;
  heroFocus: string;
  sceneFocus: string;
  arrangeFocus: string;
  needsCardCrop?: boolean;
};

const cardWork = new URL('../../场景图/card/work.png', import.meta.url).href;
const cardExercise = new URL('../../场景图/card/exercise.png', import.meta.url).href;
const cardCooking = new URL('../../场景图/card/cooking.png', import.meta.url).href;
const cardPark = new URL('../../场景图/card/park2.png', import.meta.url).href;
const cardSofa = new URL('../../场景图/card/deep.png', import.meta.url).href;
const cardDeep = new URL('../../场景图/card/deep 2.png', import.meta.url).href;
const cardSea = new URL('../../场景图/card/sea.png', import.meta.url).href;

const heroWork = new URL('../../场景图/hero/work.png', import.meta.url).href;
const heroExercise = new URL('../../场景图/hero/exercise.png', import.meta.url).href;
const heroCooking = new URL('../../场景图/hero/cooking.png', import.meta.url).href;
const heroPark = new URL('../../场景图/hero/park.png', import.meta.url).href;
const heroSofa = new URL('../../场景图/hero/deep2.png', import.meta.url).href;
const heroDeep = new URL('../../场景图/hero/deep.png', import.meta.url).href;
const heroSea = new URL('../../场景图/hero/sea.png', import.meta.url).href;

const sceneWork = new URL('../../场景图/scene chat/work.png', import.meta.url).href;
const sceneExercise = new URL('../../场景图/scene chat/exercise.png', import.meta.url).href;
const sceneCooking = new URL('../../场景图/scene chat/cooking.png', import.meta.url).href;
const scenePark = new URL('../../场景图/scene chat/park.png', import.meta.url).href;
const sceneSofa = new URL('../../场景图/scene chat/prime.png', import.meta.url).href;
const sceneDeep = new URL('../../场景图/scene chat/deep.png', import.meta.url).href;
const sceneSea = new URL('../../场景图/scene chat/sea.png', import.meta.url).href;

export const sceneImageConfig: Record<SceneType, SceneImageConfig> = {
  study: makeScene(cardWork, heroWork, sceneWork, '64% 34%', '58% 32%', '58% 32%', '60% 32%'),
  fitness: makeScene(cardExercise, heroExercise, sceneExercise, '58% 28%', '54% 28%', '54% 28%', '50% 28%'),
  meal: makeScene(cardCooking, heroCooking, sceneCooking, '52% 35%', '50% 34%', '50% 34%', '62% 35%'),
  watch: makeScene(cardSofa, heroSofa, sceneSofa, '56% 36%', '52% 38%', '52% 38%', '58% 34%'),
  idle: makeScene(cardPark, heroPark, scenePark, '58% 32%', '56% 34%', '56% 34%', '55% 30%'),
  deep_room: makeScene(cardDeep, heroDeep, sceneDeep, '50% 38%', '50% 38%', '50% 38%', '52% 35%'),
  sleep: makeScene(cardSofa, heroSofa, sceneSofa, '52% 42%', '52% 40%', '52% 40%', '58% 34%'),
  gaming: { ...makeScene(cardSofa, heroSofa, sceneSofa, '52% 42%', '52% 40%', '52% 40%', '58% 34%'), needsCardCrop: true },
  commute: makeScene(cardSea, heroSea, sceneSea, '58% 32%', '56% 34%', '56% 34%', '55% 32%'),
};

function makeScene(cardImage: string, heroImage: string, sceneImage: string, cardFocus: string, heroFocus: string, sceneFocus: string, arrangeFocus: string): SceneImageConfig {
  return {
    cardImage,
    heroImage,
    sceneImage,
    src: heroImage,
    heroSrc: heroImage,
    cardSrc: cardImage,
    arrangeSrc: cardImage,
    cardFocus,
    thumbFocus: cardFocus,
    heroFocus,
    sceneFocus,
    arrangeFocus,
  };
}

export function getSceneImage(sceneType: SceneType | null | undefined): SceneImageConfig {
  return sceneImageConfig[sceneType ?? 'idle'] ?? sceneImageConfig.idle;
}

export function getScenesNeedingCardCrop(): SceneType[] {
  return Object.entries(sceneImageConfig)
    .filter(([, config]) => config.needsCardCrop)
    .map(([sceneType]) => sceneType as SceneType);
}
