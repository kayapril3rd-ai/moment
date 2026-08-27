import { useState } from 'react';
import { SceneChat } from './components/chat/SceneChat';
import { TogetherMoments } from './components/moments/TogetherMoments';
import { TodayPage } from './components/today/TodayPage';
import { mockRecentMoments, sceneRegistry } from './data';
import { useUserProfile } from './hooks/useUserProfile';
import type { RecentMoment, SceneType } from './types/che';

type AppView = 'today' | 'scene' | 'moments';

interface SceneActions {
  endActiveActivity: (hasChat?: boolean) => void;
}

export default function App() {
  const [view, setView] = useState<AppView>('today');
  const [currentSceneType, setCurrentSceneType] = useState<SceneType>('study');
  const [currentSceneStartedAt, setCurrentSceneStartedAt] = useState<string | null>(null);
  const [recentMoments, setRecentMoments] = useState<RecentMoment[]>(mockRecentMoments);
  const [sceneActions, setSceneActions] = useState<SceneActions | null>(null);
  const { userProfile, memoryItems, setUserProfile, setMemoryItems } = useUserProfile();
  const currentScene = sceneRegistry[currentSceneType];

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
          userProfile={userProfile}
          memoryItems={memoryItems}
          onUserProfileChange={setUserProfile}
          onMemoryItemsChange={setMemoryItems}
        />
      </div>

      {view === 'scene' ? (
        <SceneChat
          scene={currentScene}
          activeStartedAt={currentSceneStartedAt}
          onBack={() => setView('today')}
          onEndActivity={
            currentSceneStartedAt && currentScene.conversationMode !== 'deep'
              ? (hasChat?: boolean) => {
                  sceneActions?.endActiveActivity(hasChat);
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
