import { useMemo, useState } from 'react';
import { SceneChat } from './components/chat/SceneChat';
import { TogetherMoments } from './components/moments/TogetherMoments';
import { TodayPage } from './components/today/TodayPage';
import { mockRecentMoments } from './data/mockMoments';
import { mockScenes } from './data/mockScenes';
import type { RecentMoment, SceneData, SceneType } from './types/che';

type AppView = 'today' | 'scene' | 'moments';

interface SceneActions {
  endActiveActivity: () => void;
}

export default function App() {
  const [view, setView] = useState<AppView>('today');
  const [currentSceneType, setCurrentSceneType] = useState<SceneType>('study');
  const [currentSceneStartedAt, setCurrentSceneStartedAt] = useState<string | null>(null);
  const [recentMoments, setRecentMoments] = useState<RecentMoment[]>(mockRecentMoments);
  const [sceneActions, setSceneActions] = useState<SceneActions | null>(null);
  const sceneById = useMemo(() => new Map(mockScenes.map((scene) => [scene.id, scene])), []);
  const currentScene = sceneById.get(currentSceneType) ?? sceneById.get('idle') as SceneData;

  const openScene = (sceneType: SceneType, activeStartedAt?: string | null) => {
    setCurrentSceneType(sceneType);
    setCurrentSceneStartedAt(activeStartedAt ?? null);
    setView('scene');
  };

  return (
    <>
      <div hidden={view !== 'today'}>
        <TodayPage
          onOpenScene={openScene}
          onOpenDeep={() => openScene('deep_room')}
          onOpenMoments={() => setView('moments')}
          onRegisterSceneActions={setSceneActions}
          recentMoments={recentMoments}
          onRecentMomentsChange={setRecentMoments}
        />
      </div>

      {view === 'scene' ? (
        <SceneChat
          scene={currentScene}
          activeStartedAt={currentSceneStartedAt}
          onBack={() => setView('today')}
          onOpenDeep={() => openScene('deep_room')}
          onEndActivity={
            currentSceneStartedAt && !currentScene.isDeepEntry
              ? () => {
                  sceneActions?.endActiveActivity();
                  setCurrentSceneStartedAt(null);
                  setView('today');
                }
              : undefined
          }
        />
      ) : null}

      {view === 'moments' ? (
        <TogetherMoments moments={recentMoments} onBack={() => setView('today')} />
      ) : null}
    </>
  );
}
