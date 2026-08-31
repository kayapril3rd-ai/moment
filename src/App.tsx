import { useMemo, useState } from 'react';
import { SceneChat } from './components/chat/SceneChat';
import { TogetherMoments } from './components/moments/TogetherMoments';
import { TodayPage } from './components/today/TodayPage';
import { sceneRegistry } from './data';
import { useCheDayState } from './hooks/useCheDayState';
import { useUserProfile } from './hooks/useUserProfile';
import type { SceneType } from './types/che';

type AppView = 'today' | 'scene' | 'moments';

export default function App() {
  const [view, setView] = useState<AppView>('today');
  const [currentSceneType, setCurrentSceneType] = useState<SceneType>('study');
  const { userProfile, memoryItems, setUserProfile, setMemoryItems } = useUserProfile();
  const chatUserContext = useMemo(() => ({
    nickname: userProfile.nickname,
    companionStyle: userProfile.preferences.companionStyle,
    chatPace: userProfile.preferences.chatPace,
    dislikes: userProfile.preferences.dislikes,
    memoryItems,
  }), [memoryItems, userProfile]);
  const dayState = useCheDayState();
  const currentScene = sceneRegistry[currentSceneType];
  const currentActiveCard = currentScene.conversationMode !== 'deep'
    && dayState.activeActivityCard?.sceneType === currentSceneType
    ? dayState.activeActivityCard
    : null;
  const currentSceneActiveStartedAt = currentActiveCard ? dayState.activeStartedAt : null;
  const currentChatLinkedPlanId = currentActiveCard?.linkedPlanId
    ?? (dayState.cheCurrentState.entrySceneType === currentSceneType
      ? dayState.cheSchedule.find((item) => item.id === dayState.cheCurrentState.scheduleItemId)?.linkedPlanId ?? null
      : null);

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
          userContext={chatUserContext}
          activeStartedAt={currentSceneActiveStartedAt}
          onBack={() => setView('today')}
          onEnd={(session) => {
            const hasChat = session.messages.some((message) => message.role === 'user');
            dayState.recordEndedChat(session, currentScene, currentChatLinkedPlanId);
            if (currentActiveCard) dayState.completeActivity(currentActiveCard, hasChat);
            setView('today');
          }}
        />
      ) : null}

      {view === 'moments' ? (
        <TogetherMoments moments={dayState.recentMoments} onBack={() => setView('today')} />
      ) : null}
    </>
  );
}
