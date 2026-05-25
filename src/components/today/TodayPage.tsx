// TodayPage 负责 MVP 的三主入口 shell，以及今日 mock state 的统一联动。
// activeActivityId / activeScene / activeStartedAt 是当前活动的唯一来源，避免 Hero 和 Scene Chat 不同步。
import { useEffect, useMemo, useState } from 'react';
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
import { cheTodaySummary, mockCheStatus, todayCopy } from '../../data/mockCheStatus';
import { mockCheSchedule, mockUserPlans } from '../../data/mockSchedule';
import { mockSceneCards } from '../../data/mockScenes';
import type { CheScheduleItem, CheStatus, DayRecord, RecentMoment, SceneCard, SceneType, TimePrecision, UserPlan } from '../../types/che';
import {
  createCheScheduleItemFromPlan,
  createRecentMomentFromPlan,
  createSharedSceneFromPlan,
  createUserPlanFromInput,
  getCheInviteReply,
} from '../../utils/plan';

interface TodayPageProps {
  onOpenScene: (sceneType: SceneType, activeStartedAt?: string | null) => void;
  onOpenDeep: () => void;
  onOpenMoments: () => void;
  onRegisterSceneActions?: (actions: { endActiveActivity: () => void }) => void;
  recentMoments: RecentMoment[];
  onRecentMomentsChange: (moments: RecentMoment[]) => void;
}

const initialDayRecords: DayRecord[] = [
  {
    id: 'record-mine-study-0522',
    date: '2026-05-22',
    owner: 'mine',
    kind: 'activity',
    title: '图书馆学习',
    timeLabel: '10:00',
    summary: '一起专注了 2 小时。',
    detail: '那段时间很安静，你把手头的任务往前推了一点。',
    sceneType: 'study',
    linkedPlanId: null,
    status: 'completed',
    startedAt: '10:00',
    endedAt: '12:00',
  },
  {
    id: 'record-mine-photo-0522',
    date: '2026-05-22',
    owner: 'mine',
    kind: 'activity',
    title: '公园拍照',
    timeLabel: '16:30',
    summary: '记录了很多美好瞬间。',
    detail: '光线很好，你们没有赶时间，只是慢慢走了一圈。',
    sceneType: 'idle',
    linkedPlanId: null,
    status: 'completed',
    startedAt: '16:30',
    endedAt: '17:20',
  },
  {
    id: 'record-mine-dinner-0522',
    date: '2026-05-22',
    owner: 'mine',
    kind: 'activity',
    title: '一起做晚餐',
    timeLabel: '19:30',
    summary: '你做饭，他打下手。',
    detail: '没有做很复杂的菜，但那顿饭被认真对待了。',
    sceneType: 'meal',
    linkedPlanId: null,
    status: 'completed',
    startedAt: '19:30',
    endedAt: '20:10',
  },
  {
    id: 'record-che-work-0522',
    date: '2026-05-22',
    owner: 'che',
    kind: 'activity',
    title: '整理评审稿',
    timeLabel: '上午',
    summary: '今天把工作收得更顺一点。',
    detail: '澈上午把体验评审稿重新顺了一遍，下午就轻松很多。',
    sceneType: 'study',
    linkedPlanId: null,
    status: 'completed',
  },
  {
    id: 'record-che-walk-0522',
    date: '2026-05-22',
    owner: 'che',
    kind: 'activity',
    title: '海边散步',
    timeLabel: '傍晚',
    summary: '风有点大，但心情不错。',
    detail: '他走得不快，回来的时候外套带了一点海边的凉意。',
    sceneType: 'idle',
    linkedPlanId: null,
    status: 'completed',
  },
  {
    id: 'record-che-deep-0522',
    date: '2026-05-22',
    owner: 'che',
    kind: 'activity',
    title: '和你安静聊聊',
    timeLabel: '夜里',
    summary: '那段话被好好收好了。',
    detail: '没有急着分析，也没有催你做决定，只是把那一块先放下来。',
    sceneType: 'deep_room',
    linkedPlanId: null,
    status: 'completed',
  },
  {
    id: 'record-letter-goodnight-0522',
    date: '2026-05-22',
    owner: 'che',
    kind: 'letter',
    title: '晚安信',
    timeLabel: '22:47',
    summary: '今天过得很充实呀，谢谢你陪我度过这么美好的一天。',
    detail: '今天过得很充实呀，谢谢你陪我度过这么美好的一天。—— 澈',
    sceneType: 'deep_room',
    linkedPlanId: null,
  },
];

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
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  const [activeScene, setActiveScene] = useState<SceneType | null>(null);
  const [activeStartedAt, setActiveStartedAt] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<UserPlan | null>(null);
  const [userPlans, setUserPlans] = useState<UserPlan[]>(mockUserPlans);
  const [cheSchedule, setCheSchedule] = useState<CheScheduleItem[]>(mockCheSchedule);
  const [sceneCards, setSceneCards] = useState<SceneCard[]>(mockSceneCards);
  const [dayRecords, setDayRecords] = useState<DayRecord[]>(initialDayRecords);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!activeStartedAt) return undefined;
    const timerId = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timerId);
  }, [activeStartedAt]);

  const activeActivityCard = useMemo(
    () => sceneCards.find((card) => card.id === activeActivityId && card.status === 'active') ?? null,
    [activeActivityId, sceneCards],
  );
  const heroStatus = activeActivityCard ? createActiveHeroStatus(activeActivityCard) : mockCheStatus;
  const heroActionLabel = activeActivityCard ? '回到场景' : todayCopy.heroActionLabel;
  const userTodaySummary = useMemo(() => createUserTodaySummary(userPlans), [userPlans]);
  const companionshipStats = useMemo(
    () => createCompanionshipStats(activeStartedAt, now, dayRecords),
    [activeStartedAt, now, dayRecords],
  );

  const updateRecentMoments = (updater: (currentMoments: RecentMoment[]) => RecentMoment[]) => {
    onRecentMomentsChange(updater(recentMoments));
  };

  const handleAddPlan = (input: string) => {
    const nextPlan = createUserPlanFromInput(input);
    if (!nextPlan) return false;
    setUserPlans((currentPlans) => [nextPlan, ...currentPlans]);
    return true;
  };

  const handleInvitePlan = (planId: string) => {
    const plan = userPlans.find((item) => item.id === planId);
    if (!plan || plan.inviteStatus === 'accepted') return;

    const acceptedPlan: UserPlan = {
      ...plan,
      inviteStatus: 'accepted',
      status: 'accepted',
      inviteReply: getCheInviteReply(plan),
      updatedAt: new Date().toISOString(),
    };

    setUserPlans((currentPlans) => currentPlans.map((item) => (item.id === planId ? acceptedPlan : item)));
    setSelectedPlan((currentPlan) => (currentPlan?.id === planId ? acceptedPlan : currentPlan));

    setSceneCards((currentCards) => {
      if (currentCards.some((card) => card.linkedPlanId === planId && card.status === 'scheduled')) return currentCards;

      const shiftedCards = currentCards.map((card) => ({ ...card, sortOrder: card.sortOrder + 1 }));
      if (currentCards.some((card) => card.linkedPlanId === planId)) {
        return shiftedCards.map((card) =>
          card.linkedPlanId === planId ? { ...createSharedSceneFromPlan(acceptedPlan, 1), id: card.id } : card,
        );
      }
      return [createSharedSceneFromPlan(acceptedPlan, 1), ...shiftedCards];
    });

    setCheSchedule((currentSchedule) => {
      if (currentSchedule.some((item) => item.linkedPlanId === planId)) return currentSchedule;
      return [...currentSchedule, createCheScheduleItemFromPlan(acceptedPlan)].sort((a, b) =>
        (a.startTime || a.timeLabel || '').localeCompare(b.startTime || b.timeLabel || ''),
      );
    });

    updateRecentMoments((currentMoments) => {
      if (currentMoments.some((moment) => moment.linkedPlanId === planId)) return currentMoments;
      return [createRecentMomentFromPlan(acceptedPlan), ...currentMoments];
    });
  };

  const activateActivity = (card: SceneCard) => {
    const startedAt = new Date().toISOString();
    const activeCard = {
      ...card,
      status: 'active' as const,
      timeLabel: '进行中',
      timePrecision: 'open' as const,
      description: getActiveCardDescription(card.sceneType),
    };

    setActiveActivityId(card.id);
    setActiveScene(card.sceneType);
    setActiveStartedAt(startedAt);
    setActivityDetailCard(null);
    setActivitySetupCard(null);
    setActiveMainTab('today');

    setSceneCards((currentCards) =>
      currentCards.map((item) => (item.id === card.id ? activeCard : item.status === 'active' ? { ...item, status: 'scheduled', timeLabel: item.timeHint } : item)),
    );

    if (card.linkedPlanId) {
      setUserPlans((currentPlans) =>
        currentPlans.map((plan) => (plan.id === card.linkedPlanId ? { ...plan, status: 'active', updatedAt: startedAt } : plan)),
      );
    }

    setCheSchedule((currentSchedule) => syncCheScheduleForActive(currentSchedule, activeCard, startedAt));
    updateRecentMoments((currentMoments) =>
      addUniqueMoment(currentMoments, createMoment({
        id: `moment-active-${card.id}`,
        text: getActiveMomentText(card),
        sourceScene: card.sceneType,
        linkedPlanId: card.linkedPlanId,
      })),
    );
  };

  const completeActivity = (card: SceneCard) => {
    const completedAt = new Date().toISOString();
    const completedCard = { ...card, status: 'completed' as const, timeLabel: '已完成', timePrecision: 'period' as const };

    setSceneCards((currentCards) => currentCards.map((item) => (item.id === card.id ? completedCard : item)));

    if (card.linkedPlanId) {
      setUserPlans((currentPlans) =>
        currentPlans.map((plan) => (plan.id === card.linkedPlanId ? { ...plan, status: 'done', updatedAt: completedAt } : plan)),
      );
    }

    if (activeActivityId === card.id) {
      setActiveActivityId(null);
      setActiveScene(null);
      setActiveStartedAt(null);
    }

    setCheSchedule((currentSchedule) =>
      currentSchedule.map((item) =>
        item.linkedPlanId === card.linkedPlanId && item.type === 'shared'
          ? { ...item, detail: '这段一起做的事已经完成了。' }
          : item,
      ),
    );

    setDayRecords((currentRecords) => addUniqueRecord(currentRecords, createActivityRecord(card, activeStartedAt, completedAt)));
    setActivityDetailCard(null);
    updateRecentMoments((currentMoments) =>
      addUniqueMoment(currentMoments, createMoment({
        id: `moment-completed-${card.id}`,
        text: `你们完成了${card.title}。`,
        sourceScene: card.sceneType,
        linkedPlanId: card.linkedPlanId,
      })),
    );
  };

  const updateActivityTime = (card: SceneCard, timeLabel: string) => {
    const nextPrecision = getTimePrecisionFromLabel(timeLabel);
    const nextCard = { ...card, status: 'scheduled' as const, timeHint: timeLabel, timeLabel, timePrecision: nextPrecision };
    setSceneCards((currentCards) => currentCards.map((item) => (item.id === card.id ? nextCard : item)));

    if (card.linkedPlanId) {
      updatePlan(card.linkedPlanId, {
        startTime: extractStartTime(timeLabel),
        timeLabel,
        timePrecision: nextPrecision,
        status: 'accepted',
      });
    }

    setActivitySetupCard(null);
    setActivityDetailCard(nextCard);
  };

  const updatePlan = (planId: string, updates: Partial<UserPlan>) => {
    const nextUpdates = { ...updates, updatedAt: new Date().toISOString() };
    setUserPlans((currentPlans) => currentPlans.map((plan) => (plan.id === planId ? { ...plan, ...nextUpdates } : plan)));
    setSelectedPlan((currentPlan) => (currentPlan?.id === planId ? { ...currentPlan, ...nextUpdates } : currentPlan));
    setSceneCards((currentCards) =>
      currentCards.map((card) =>
        card.linkedPlanId === planId
          ? { ...card, timeHint: updates.timeLabel ?? card.timeHint, timeLabel: updates.timeLabel ?? card.timeLabel, timePrecision: updates.timePrecision ?? card.timePrecision }
          : card,
      ),
    );
    setCheSchedule((currentSchedule) =>
      currentSchedule.map((item) =>
        item.linkedPlanId === planId
          ? { ...item, startTime: updates.startTime ?? item.startTime, timeLabel: updates.timeLabel ?? item.timeLabel, timePrecision: updates.timePrecision ?? item.timePrecision, title: updates.title ?? item.title }
          : item,
      ),
    );
  };

  const cancelInvite = (planId: string) => {
    if (activeActivityCard?.linkedPlanId === planId) {
      setActiveActivityId(null);
      setActiveScene(null);
      setActiveStartedAt(null);
    }
    updatePlan(planId, { inviteStatus: 'not_invited', status: 'todo' });
    setCheSchedule((currentSchedule) => currentSchedule.filter((item) => item.linkedPlanId !== planId));
    setSceneCards((currentCards) => currentCards.filter((card) => card.linkedPlanId !== planId));
  };

  const completePlan = (planId: string) => {
    const relatedCard = sceneCards.find((card) => card.linkedPlanId === planId);
    if (relatedCard) {
      completeActivity(relatedCard);
      setSelectedPlan(null);
      return;
    }
    updatePlan(planId, { status: 'done' });
    setSelectedPlan(null);
  };

  const restoreTodo = (planId: string) => {
    updatePlan(planId, { status: 'todo' });
    setSceneCards((currentCards) =>
      currentCards.map((card) => (card.linkedPlanId === planId && card.status === 'completed' ? { ...card, status: 'scheduled', timeLabel: card.timeHint } : card)),
    );
  };

  const deletePlan = (planId: string) => {
    if (activeActivityCard?.linkedPlanId === planId) {
      setActiveActivityId(null);
      setActiveScene(null);
      setActiveStartedAt(null);
    }
    setUserPlans((currentPlans) => currentPlans.filter((plan) => plan.id !== planId));
    setCheSchedule((currentSchedule) => currentSchedule.filter((item) => item.linkedPlanId !== planId));
    setSceneCards((currentCards) => currentCards.filter((card) => card.linkedPlanId !== planId));
    setSelectedPlan(null);
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
                status={heroStatus}
                copy={todayCopy}
                actionLabel={heroActionLabel}
                onOpenScene={() => {
                  if (activeActivityCard) {
                    openActiveScene();
                    return;
                  }
                  onOpenScene('study');
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
            onStart={() => activateActivity(activityDetailCard)}
            onEdit={() => {
              setActivityDetailCard(null);
              setActiveMainTab('arrange');
            }}
            onCancel={() => {
              setSceneCards((currentCards) => currentCards.map((card) => (card.id === activityDetailCard.id ? { ...card, status: 'disabled', timeLabel: '已取消' } : card)));
              setActivityDetailCard(null);
            }}
            onBackToScene={() => onOpenScene(activeScene ?? activityDetailCard.sceneType, activeStartedAt)}
            onComplete={() => completeActivity(activityDetailCard)}
            onOpenMoments={() => {
              setActivityDetailCard(null);
              onOpenMoments();
            }}
          />
        ) : null}

        {activitySetupCard ? (
          <ActivitySetup card={activitySetupCard} onClose={() => setActivitySetupCard(null)} onStart={() => activateActivity(activitySetupCard)} onSchedule={(timeLabel) => updateActivityTime(activitySetupCard, timeLabel)} />
        ) : null}
      </div>
    </main>
  );
}

function createActiveHeroStatus(card: SceneCard): CheStatus {
  return {
    ...mockCheStatus,
    id: `active-${card.id}`,
    period: '现在',
    location: getActiveLocation(card.sceneType),
    currentActivity: `你们正在${card.title}`,
    detail: getActiveDetail(card.sceneType),
    availableScenes: [card.sceneType],
    updatedAt: new Date().toISOString(),
  };
}

function createUserTodaySummary(plans: UserPlan[]) {
  const todoCount = plans.filter((plan) => !plan.status || plan.status === 'todo').length;
  const activeCount = plans.filter((plan) => plan.status === 'active').length;
  const acceptedCount = plans.filter((plan) => plan.inviteStatus === 'accepted' && plan.status !== 'done' && plan.status !== 'active').length;
  const nextPlan = plans.find((plan) => plan.status === 'active') ?? plans.find((plan) => plan.status !== 'done' && plan.status !== 'cancelled');
  const activeText = activeCount > 0 ? ` · ${activeCount} 件进行中` : '';

  return {
    title: `${todoCount} 件待做 · ${acceptedCount} 件已约好${activeText}`,
    detail: nextPlan ? `下一件：${nextPlan.title}` : '今天暂时没有新的安排',
  };
}

function createCompanionshipStats(activeStartedAt: string | null, now: number, records: DayRecord[]) {
  const completedMinutes = records.filter((record) => record.kind === 'activity' && record.owner === 'mine').length * 10;
  const activeMinutes = activeStartedAt ? Math.max(0, Math.floor((now - new Date(activeStartedAt).getTime()) / 60_000)) : 0;
  const totalMinutes = 20 + completedMinutes + activeMinutes;
  return {
    title: `${totalMinutes} 分钟`,
    detail: activeMinutes > 0 ? '正在一起的时间也在计入' : '比昨天多 32 分钟',
  };
}

function syncCheScheduleForActive(schedule: CheScheduleItem[], card: SceneCard, startedAt: string): CheScheduleItem[] {
  const activeItem: CheScheduleItem = {
    id: `che-active-${card.id}`,
    title: `正在陪你${card.title.replace('一起', '')}`,
    startTime: new Date(startedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
    endTime: null,
    timeLabel: '现在',
    timePrecision: 'open',
    type: 'shared',
    source: 'mock',
    sceneType: card.sceneType,
    linkedPlanId: card.linkedPlanId,
    detail: getActiveCheScheduleDetail(card.sceneType),
  };

  if (card.linkedPlanId && schedule.some((item) => item.linkedPlanId === card.linkedPlanId)) {
    return schedule.map((item) => (item.linkedPlanId === card.linkedPlanId ? activeItem : item));
  }
  return [activeItem, ...schedule.filter((item) => item.id !== activeItem.id)];
}

function createActivityRecord(card: SceneCard, startedAt: string | null, completedAt: string): DayRecord {
  return {
    id: `record-${card.id}`,
    date: toDateKey(new Date(completedAt)),
    owner: 'mine',
    kind: 'activity',
    title: card.title,
    timeLabel: `${card.timeHint} · 已完成`,
    summary: getCompletedRecordSummary(card.sceneType),
    detail: getCompletedRecordDetail(card.sceneType),
    sceneType: card.sceneType,
    linkedPlanId: card.linkedPlanId,
    status: 'completed',
    startedAt: startedAt ? formatTime(startedAt) : card.timeHint,
    endedAt: formatTime(completedAt),
  };
}

function getActiveLocation(sceneType: SceneType): string {
  switch (sceneType) {
    case 'fitness': return '健身房';
    case 'meal': return '餐桌旁';
    case 'watch': return '客厅';
    case 'study': return '书桌边';
    case 'sleep': return '睡前';
    default: return '身边';
  }
}

function getActiveDetail(sceneType: SceneType): string {
  switch (sceneType) {
    case 'fitness': return '他会陪你开始，不用一下子练得太狠。';
    case 'meal': return '先把热的吃下去，别一边吃一边绷着。';
    case 'watch': return '他去倒了杯水，坐回沙发边。';
    case 'study': return '他也在书桌边，把这一小段时间留给专注。';
    case 'sleep': return '声音放轻一点，今天不用把话都说完。';
    default: return '他在这里，陪你把这一小段时间过稳。';
  }
}

function getActiveCardDescription(sceneType: SceneType): string {
  switch (sceneType) {
    case 'fitness': return '已经开始了。先热身，别一下子太狠。';
    case 'watch': return '你们已经坐下来了，今晚就轻一点。';
    case 'meal': return '正在吃点热的，先不用急着说太多。';
    case 'study': return '这段时间留给专注，澈也在书桌边。';
    default: return '这件事正在发生，澈在你身边。';
  }
}

function getActiveCheScheduleDetail(sceneType: SceneType): string {
  switch (sceneType) {
    case 'fitness': return '他在陪你开始训练，提醒你先稳一点。';
    case 'watch': return '他倒了杯水，坐回沙发边陪你慢慢看。';
    case 'meal': return '他把这段时间留给了好好吃饭。';
    default: return '他把这段时间留给你们一起做这件事。';
  }
}

function getActiveMomentText(card: SceneCard): string {
  if (card.sceneType === 'fitness') return '你们提前开始了晚点的健身。';
  if (card.sceneType === 'watch') return '你们现在开始一起看电影。';
  return `你们开始了${card.title}。`;
}

function getCompletedRecordSummary(sceneType: SceneType): string {
  if (sceneType === 'fitness') return '你们练了背，澈提醒你今天不要一下子练太狠。';
  if (sceneType === 'watch') return '你们慢慢看完了一部，没有把今天绷得太紧。';
  return '这段一起做的事被收进今天。';
}

function getCompletedRecordDetail(sceneType: SceneType): string {
  if (sceneType === 'fitness') return '开始前他让你先活动肩背，后面也没有催你加重量。';
  if (sceneType === 'watch') return '剧情没必要一次看完，轻一点也算把晚上过稳。';
  return '这是一段轻的共同记录。';
}

function getTimePrecisionFromLabel(timeLabel: string): TimePrecision {
  if (/^\d{1,2}:\d{2}$/.test(timeLabel)) return 'exact';
  if (/左右|大概/.test(timeLabel)) return 'approximate';
  if (/现在|稍后|时间待定/.test(timeLabel)) return 'open';
  return 'period';
}

function extractStartTime(timeLabel: string): string {
  return timeLabel.match(/\d{1,2}:\d{2}/)?.[0] ?? '';
}

function addUniqueMoment(currentMoments: RecentMoment[], moment: RecentMoment): RecentMoment[] {
  if (currentMoments.some((item) => item.id === moment.id)) return currentMoments;
  return [moment, ...currentMoments];
}

function addUniqueRecord(currentRecords: DayRecord[], record: DayRecord): DayRecord[] {
  if (currentRecords.some((item) => item.id === record.id)) {
    return currentRecords.map((item) => (item.id === record.id ? record : item));
  }
  return [record, ...currentRecords];
}

function createMoment({ id, text, sourceScene, linkedPlanId }: { id: string; text: string; sourceScene: SceneType | null; linkedPlanId: string | null }): RecentMoment {
  return { id, time: '刚刚', text, sourceScene, linkedPlanId, createdAt: new Date().toISOString() };
}

function formatTime(isoTime: string): string {
  return new Date(isoTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
