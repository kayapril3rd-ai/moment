import { useEffect, useMemo, useRef, useState } from 'react';
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
import { DeepChatSummaryDrawer, getDeepChatCardSummary } from './DeepChatSummaryDrawer';
import { HeroStatusCard } from './HeroStatusCard';
import { QuietChatEntry } from './QuietChatEntry';
import { RecentMoments } from './RecentMoments';
import { SceneCardList } from './SceneCardList';
import { todayCopy } from '../../data';
import type { ArrangeTab } from '../../hooks/useArrangeDateState';
import type { UserProfile } from '../../data/mockProfile';
import type { SceneCard, SceneType } from '../../types/che';
import type { CheDayState } from '../../hooks/useCheDayState';
import { toDateKey } from '../../utils/date';

interface TodayPageProps {
  onOpenScene: (sceneType: SceneType) => void;
  onOpenDeep: () => void;
  onOpenMoments: () => void;
  dayState: CheDayState;
  userProfile: UserProfile;
  memoryItems: string[];
  onUserProfileChange: (profile: UserProfile) => void;
  onMemoryItemsChange: (items: string[]) => void;
}

export function TodayPage({
  onOpenScene,
  onOpenDeep,
  onOpenMoments,
  dayState,
  userProfile,
  memoryItems,
  onUserProfileChange,
  onMemoryItemsChange,
}: TodayPageProps) {
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('today');
  const [arrangeInitialTab, setArrangeInitialTab] = useState<ArrangeTab>('mine');
  const [dayOverviewType, setDayOverviewType] = useState<'user' | 'che' | null>(null);
  const [isCompanionshipOpen, setIsCompanionshipOpen] = useState(false);
  const [isDeepSummaryOpen, setIsDeepSummaryOpen] = useState(false);
  const [activityDetailCard, setActivityDetailCard] = useState<SceneCard | null>(null);
  const [activitySetupCard, setActivitySetupCard] = useState<SceneCard | null>(null);
  const {
    activeActivityCard,
    activeActivityId,
    activeStartedAt,
    activateActivity,
    cancelInvite,
    cancelSceneCard,
    cheSchedule,
    cheCurrentState,
    companionshipStats,
    completeActivity,
    completePlan,
    dayRecords,
    deletePlan,
    getCheScheduleForDate,
    handleAddPlan,
    handleInvitePlan,
    notifications,
    now,
    recentMoments,
    restoreTodo,
    sceneCards,
    selectedPlan,
    setSelectedPlanId,
    updateActivityTime,
    updatePlan,
    userPlans,
    userTodaySummary,
  } = dayState;

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
      case 'active':
        onOpenScene(activeActivityId === card.id ? activeActivityCard?.sceneType ?? card.sceneType : card.sceneType);
        break;
      case 'availableNow':
      default:
        onOpenScene(card.sceneType);
        break;
    }
  };

  const openActiveScene = () => {
    if (activeActivityCard) onOpenScene(activeActivityCard.sceneType);
  };
  const deepChatSummary = getDeepChatCardSummary(dayRecords, now);
  const todayKey = toDateKey(new Date(now));
  const todayUserPlans = useMemo(
    () => userPlans.filter((plan) => (plan.dateKey ?? toDateKey(new Date(plan.createdAt))) === todayKey),
    [todayKey, userPlans],
  );

  const openCheSchedule = () => {
    setArrangeInitialTab('che');
    setActiveMainTab('arrange');
  };

  const handleMainTabChange = (tab: MainTab) => {
    if (tab === 'arrange') setArrangeInitialTab('mine');
    setActiveMainTab(tab);
  };

  useEffect(() => {
    mainScrollRef.current?.scrollTo({ top: 0 });
  }, [activeMainTab]);

  return (
    <main className="app-shell" aria-labelledby="app-title">
      <div className="phone-frame">
        <div className="main-scroll-content" ref={mainScrollRef}>
          <h1 className="sr-only" id="app-title">此刻</h1>

          {activeMainTab === 'today' ? (
            <>
              <AppTopBar
                notifications={notifications}
                showNotification
              />
              <HeroStatusCard
                state={cheCurrentState}
                onOpenScene={cheCurrentState.entrySceneType ? () => onOpenScene(cheCurrentState.entrySceneType as SceneType) : undefined}
              />
              <QuietChatEntry onOpen={onOpenDeep} />
              <CompanionOverviewGrid
                companionshipTitle={companionshipStats.title}
                companionshipDetail={companionshipStats.detail}
                deepTalkTitle={deepChatSummary.title}
                deepTalkDetail={deepChatSummary.detail}
                userTitle={userTodaySummary.title}
                userDetail={userTodaySummary.detail}
                cheTitle={cheCurrentState.activity}
                cheDetail={`${cheCurrentState.location} · ${cheCurrentState.detail}`}
                onOpenCompanionship={() => setIsCompanionshipOpen(true)}
                onOpenDeep={() => setIsDeepSummaryOpen(true)}
                onOpenUser={() => setDayOverviewType('user')}
                onOpenChe={() => setDayOverviewType('che')}
              />
              <SceneCardList title={todayCopy.sceneSectionTitle} cards={sceneCards} onSelectScene={handleSceneCardSelect} />
              <RecentMoments
                title={todayCopy.momentsSectionTitle}
                archiveLabel={todayCopy.momentsArchiveLabel}
                moments={recentMoments}
                now={now}
                onOpenArchive={onOpenMoments}
                onOpenCheSchedule={openCheSchedule}
              />
            </>
          ) : null}

          {activeMainTab === 'arrange' ? (
            <ArrangePage initialTab={arrangeInitialTab} userPlans={userPlans} getCheScheduleForDate={getCheScheduleForDate} dayRecords={dayRecords} onAddPlan={handleAddPlan} onInvitePlan={handleInvitePlan} onSelectPlan={(plan) => setSelectedPlanId(plan.id)} />
          ) : null}

          {activeMainTab === 'mine' ? (
            <MinePage
              userProfile={userProfile}
              memoryItems={memoryItems}
              dayRecords={dayRecords}
              recentMoments={recentMoments}
              onUserProfileChange={onUserProfileChange}
              onMemoryItemsChange={onMemoryItemsChange}
            />
          ) : null}
        </div>

        <div className="bottom-fixed-area">
          <BottomNav activeTab={activeMainTab} onTabChange={handleMainTabChange} />
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
          userPlans={todayUserPlans}
          cheSchedule={cheSchedule}
          onClose={() => setDayOverviewType(null)}
          onManageToday={() => {
            setDayOverviewType(null);
            setActiveMainTab('arrange');
          }}
        />

        <DeepChatSummaryDrawer
          isOpen={isDeepSummaryOpen}
          records={dayRecords}
          now={now}
          onClose={() => setIsDeepSummaryOpen(false)}
        />

        {selectedPlan ? (
          <PlanDetailSheet plan={selectedPlan} onClose={() => setSelectedPlanId(null)} onUpdate={updatePlan} onInvite={handleInvitePlan} onCancelInvite={cancelInvite} onComplete={completePlan} onRestoreTodo={restoreTodo} onDelete={deletePlan} />
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
            onBackToScene={() => onOpenScene(activeActivityCard?.sceneType ?? activityDetailCard.sceneType)}
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
