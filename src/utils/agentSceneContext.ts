import type {
  AgentSceneContext,
  AgentSceneDefinition,
  SceneType,
} from '../types/che';

/**
 * Stable bridge from UI/activity routing to the coarser Agent scene taxonomy.
 * Agent-only concepts such as errand/grocery or hangout/park can use the same
 * AgentSceneDefinition shape without being added to SceneType prematurely.
 */
export const AGENT_SCENE_BY_SCENE_TYPE: Readonly<Record<SceneType, AgentSceneDefinition>> = {
  study: { sceneKey: 'focus', sceneVariant: 'work_desk' },
  watch: { sceneKey: 'home_idle', sceneVariant: 'movie_night' },
  fitness: { sceneKey: 'fitness', sceneVariant: 'home_gym' },
  meal: { sceneKey: 'meal', sceneVariant: 'cooking' },
  gaming: { sceneKey: 'home_idle', sceneVariant: 'gaming_sofa' },
  sleep: { sceneKey: 'home_idle', sceneVariant: 'bedside_night' },
  commute: { sceneKey: 'commute', sceneVariant: 'city_evening' },
  idle: { sceneKey: 'home_idle', sceneVariant: 'sofa_evening' },
  deep_room: { sceneKey: 'deep_room', sceneVariant: 'window_night' },
};

export function getAgentSceneContext(
  sceneType: SceneType,
  cheCurrentState?: string,
): AgentSceneContext {
  const definition = AGENT_SCENE_BY_SCENE_TYPE[sceneType];
  return cheCurrentState === undefined
    ? { ...definition }
    : { ...definition, cheCurrentState };
}
