// TodayPage 负责 MVP 的三主入口 shell，以及今日 mock state 的统一联动。
// activeActivityId / activeScene / activeStartedAt 是当前活动的唯一来源，避免 Hero 和 Scene Chat 不同步。
import { useEffect, useState } from 'react';
import { ActivityDetail } from '../activity/ActivityDetail';
import { ActivitySetup } from '../activity/ActivitySetup';
import { ArrangePage } from '../arrange/ArrangePage';
import { CompanionshipDrawer } from '../day/CompanionshipDrawer';
import { DayOverviewDrawer } from '../day/DayOverviewDrawer';
import { MinePage } from '../mine/MinePage';
import { AppTopBar } from '../navigation/AppTopBar';
import { BottomNav, type MainTab } from '../navigation/BottomNav';
import { PlanDetailSheet } from '../schedule/PlanDetailSheet';
import { CompanionOverviewGrid } from './CompanionOverviewGrid';
import { HeroStatusCard } from './HeroStatusCard';
import { QuietChatEntry } from './QuietChatEntry';
import { RecentMoments } from './RecentMoments';
import { SceneCardList } from './SceneCardList';
import { cheTodaySummary, todayCopy } from '../../data';
import type { RecentMoment, SceneCard, SceneType } from '../../types/che';
import { useCheDayState } from '../../hooks/useCheDayState';

interface TodayPageProps {
  onOpenScene: (sceneType: SceneType, activeStartedAt?: string | null) => void;
  onOpenDeep: () => void;
  onOpenMoments: () => void;
  onRegisterSceneActions?: (actions: { endActiveActivity: () => void }) => void;
  recentMoments: RecentMoment[];
  onRecentMomentsChange: (moments: RecentMoment[]) => void;
}

export function TodayPage({
  onOpenScene,
  onOpenDeep,
  onOpenMoments,
  onRegisterSceneActions,
  recentMoments,
  onRecentMomentsChange,
}: TodayPageProps) {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('today');
  const [dayOverviewType, setDayOverviewType] = useState<'user' | 'che' | null>(null);
  const [isCompanionshipOpen, setIsCompanionshipOpen] = useState(false);
  const [activityDetailCard, setActivityDetailCard] = useState<SceneCard | null>(null);
  const [activitySetupCard, setActivitySetupCard] = useState<SceneCard | null>(null);
  const {
    activeActivityCard,
    activeActivityId,
    activeScene,
    activeStartedAt,
    activateActivity,
    cancelInvite,
    cancelSceneCard,
    cheSchedule,
    companionshipStats,
    completeActivity,
    completePlan,
    dayRecords,
    deletePlan,
    displayHeroActionLabel,
    displayHeroStatus,
    handleAddPlan,
    handleInvitePlan,
    now,
    restoreTodo,
    sceneCards,
    selectedPlan,
    setSelectedPlan,
    updateActivityTime,
    updatePlan,
    upcomingHeroCard,
    userPlans,
    userTodaySummary,
  } = useCheDayState({ recentMoments, onRecentMomentsChange });

  const startActivity = (card: SceneCard) => {
    activateActivity(card);
    setActivityDetailCard(null);
    setActivitySetupCard(null);
    setActiveMainTab('today');
  };

  const finishActivity = (card: SceneCard) => {
    completeActivity(card);
    setActivityDetailCard(null);
  };

  const scheduleActivity = (card: SceneCard, timeLabel: string) => {
    const nextCard = updateActivityTime(card, timeLabel);
    setActivitySetupCard(null);
    setActivityDetailCard(nextCard);
  };

  useEffect(() => {
    onRegisterSceneActions?.({
      endActiveActivity: () => {
        if (activeActivityCard) completeActivity(activeActivityCard);
      },
    });
  }, [activeActivityCard, onRegisterSceneActions]);

  const handleSceneCardSelect = (card: SceneCard) => {
    switch (card.status) {
      case 'scheduled':
      case 'completed':
      case 'disabled':
        setActivityDetailCard(card);
        break;
      case 'flexible':
        setActivitySetupCard(card);
        break;
      case 'deep':
        onOpenDeep();
        break;
      case 'active':
        onOpenScene(activeActivityId === card.id ? activeScene ?? card.sceneType : card.sceneType, activeActivityId === card.id ? activeStartedAt : null);
        break;
      case 'availableNow':
      default:
        onOpenScene(card.sceneType);
        break;
    }
  };

  const openActiveScene = () => {
    if (activeActivityCard) onOpenScene(activeScene ?? activeActivityCard.sceneType, activeStartedAt);
  };

  return (
    <main className="app-shell" aria-labelledby="app-title">
      <div className="phone-frame">
        <div className="main-scroll-content">
          <h1 className="sr-only" id="app-title">此刻</h1>

          {activeMainTab === 'today' ? (
            <>
              <AppTopBar
                greeting="下午好，澈"
                subtitle="今天想和他做些什么呢？"
                description="温柔的 AI 陪伴，让每个平凡的日子，都更从容一点。"
              />
              <HeroStatusCard
                status={displayHeroStatus}
                copy={todayCopy}
                actionLabel={displayHeroActionLabel}
                onOpenScene={() => {
                  if (activeActivityCard) {
                    openActiveScene();
                    return;
                  }
                  onOpenScene(upcomingHeroCard?.sceneType ?? 'study');
                }}
              />
              <QuietChatEntry onOpen={onOpenDeep} />
              <CompanionOverviewGrid
                companionshipTitle="50 分钟"
                companionshipDetail="比昨天多 32 分钟"
                deepTalkTitle="2 段深聊"
                deepTalkDetail="下午 · 夜里"
                userTitle="1 待做 · 1 已约"
                userDetail="下个：吃点热的"
                cheTitle={cheTodaySummary.title}
                cheDetail={cheTodaySummary.detail}
                onOpenCompanionship={() => setIsCompanionshipOpen(true)}
                onOpenDeep={onOpenDeep}
                onOpenUser={() => setDayOverviewType('user')}
                onOpenChe={() => setDayOverviewType('che')}
              />
              <SceneCardList title={todayCopy.sceneSectionTitle} cards={sceneCards} onSelectScene={handleSceneCardSelect} />
              <RecentMoments title={todayCopy.momentsSectionTitle} archiveLabel={todayCopy.momentsArchiveLabel} moments={recentMoments} onOpenMoments={() => setActiveMainTab('arrange')} />
            </>
          ) : null}

          {activeMainTab === 'arrange' ? (
            <ArrangePage userPlans={userPlans} cheSchedule={cheSchedule} dayRecords={dayRecords} onAddPlan={handleAddPlan} onInvitePlan={handleInvitePlan} onSelectPlan={setSelectedPlan} />
          ) : null}

          {activeMainTab === 'mine' ? <MinePage /> : null}
        </div>

        <div className="bottom-fixed-area">
          <BottomNav activeTab={activeMainTab} onTabChange={setActiveMainTab} />
        </div>

        <CompanionshipDrawer
          isOpen={isCompanionshipOpen}
          activeCard={activeActivityCard}
          activeStartedAt={activeStartedAt}
          now={now}
          records={dayRecords}
          onClose={() => setIsCompanionshipOpen(false)}
          onOpenActive={() => {
            setIsCompanionshipOpen(false);
            openActiveScene();
          }}
          onOpenRecord={(record) => {
            setIsCompanionshipOpen(false);
            const relatedCard = sceneCards.find((card) => card.linkedPlanId === record.linkedPlanId) ?? sceneCards.find((card) => card.sceneType === record.sceneType);
            if (relatedCard) setActivityDetailCard({ ...relatedCard, status: 'completed', timeLabel: '已完成' });
          }}
        />

        <DayOverviewDrawer
          isOpen={dayOverviewType !== null}
          type={dayOverviewType ?? 'user'}
          userPlans={userPlans}
          cheSchedule={cheSchedule}
          onClose={() => setDayOverviewType(null)}
          onManageToday={() => {
            setDayOverviewType(null);
            setActiveMainTab('arrange');
          }}
        />

        {selectedPlan ? (
          <PlanDetailSheet plan={selectedPlan} onClose={() => setSelectedPlan(null)} onUpdate={updatePlan} onInvite={handleInvitePlan} onCancelInvite={cancelInvite} onComplete={completePlan} onRestoreTodo={restoreTodo} onDelete={deletePlan} />
        ) : null}

        {activityDetailCard ? (
          <ActivityDetail
            card={activityDetailCard}
            onClose={() => setActivityDetailCard(null)}
            onStart={() => startActivity(activityDetailCard)}
            onEdit={() => {
              setActivityDetailCard(null);
              setActiveMainTab('arrange');
            }}
            onCancel={() => {
              cancelSceneCard(activityDetailCard.id);
              setActivityDetailCard(null);
            }}
            onBackToScene={() => onOpenScene(activeScene ?? activityDetailCard.sceneType, activeStartedAt)}
            onComplete={() => finishActivity(activityDetailCard)}
            onOpenMoments={() => {
              setActivityDetailCard(null);
              onOpenMoments();
            }}
          />
        ) : null}

        {activitySetupCard ? (
          <ActivitySetup card={activitySetupCard} onClose={() => setActivitySetupCard(null)} onStart={() => startActivity(activitySetupCard)} onSchedule={(timeLabel) => scheduleActivity(activitySetupCard, timeLabel)} />
        ) : null}
      </div>
    </main>
  );
}
