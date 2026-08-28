import { useState } from 'react';
import { SceneChat } from './components/chat/SceneChat';
import { TogetherMoments } from './components/moments/TogetherMoments';
import { TodayPage } from './components/today/TodayPage';
import { mockRecentMoments, sceneRegistry } from './data';
import { useCheDayState } from './hooks/useCheDayState';
import { useUserProfile } from './hooks/useUserProfile';
import type { RecentMoment, SceneType } from './types/che';

type AppView = 'today' | 'scene' | 'moments';

export default function App() {
  const [view, setView] = useState<AppView>('today');
  const [currentSceneType, setCurrentSceneType] = useState<SceneType>('study');
  const [recentMoments, setRecentMoments] = useState<RecentMoment[]>(mockRecentMoments);
  const { userProfile, memoryItems, setUserProfile, setMemoryItems } = useUserProfile();
  const dayState = useCheDayState({ recentMoments, onRecentMomentsChange: setRecentMoments });
  const currentScene = sceneRegistry[currentSceneType];
  const currentActiveCard = currentScene.conversationMode !== 'deep'
    && dayState.activeActivityCard?.sceneType === currentSceneType
    ? dayState.activeActivityCard
    : null;
  const currentSceneActiveStartedAt = currentActiveCard ? dayState.activeStartedAt : null;

  const openScene = (sceneType: SceneType) => {
    setCurrentSceneType(sceneType);
    setView('scene');
  };

  return (
    <>
      <div hidden={view !== 'today'}>
        <TodayPage
          onOpenScene={openScene}
          onOpenDeep={() => openScene('deep_room')}
          onOpenMoments={() => setView('moments')}
          dayState={dayState}
          userProfile={userProfile}
          memoryItems={memoryItems}
          onUserProfileChange={setUserProfile}
          onMemoryItemsChange={setMemoryItems}
        />
      </div>

      {view === 'scene' ? (
        <SceneChat
          scene={currentScene}
          cheCurrentState={dayState.cheCurrentState}
          activeStartedAt={currentSceneActiveStartedAt}
          onBack={() => setView('today')}
          onEndActivity={
            currentActiveCard
              ? (hasChat?: boolean) => {
                  dayState.completeActivity(currentActiveCard, hasChat);
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
