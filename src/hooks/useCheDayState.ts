import { useCallback, useEffect, useMemo, useState } from 'react';
import { mockSceneCards } from '../data';
import type { CheScheduleItem, DayRecord, RecentMoment, SceneCard, SceneData, UserPlan } from '../types/che';
import {
  addUniqueMoment,
  addUniqueRecord,
  completeCheScheduleForActivity,
  createActivityRecord,
  createMoment,
  extractStartTime,
  getActiveCardDescription,
  getActiveMomentText,
  getTimePrecisionFromLabel,
  syncCheScheduleForActive,
} from '../utils/activityState';
import {
  createCheScheduleItemFromPlan,
  createRecentMomentFromPlan,
  createSharedSceneFromPlan,
  createUserPlanFromInput,
  getCheInviteReply,
  getUserPlanDateKey,
  restoreCheScheduleItemFromPlan,
} from '../utils/plan';
import { useCheDayDerivedState } from './useCheDayDerivedState';
import { toDateKey } from '../utils/date';
import { getCheScheduleForDate as mergeCheScheduleForDate } from '../utils/cheSchedule.ts';
import type { StoredChatSession } from '../utils/chatStorage';
import type { EndedChatProcessingResult } from '../types/chatSummary';
import { summarizeEndedChat } from '../services/chatSummaryClient';
import {
  applyChatSummaryToRecord,
  createChatSummaryFallback,
  formatChatTranscript,
} from '../utils/chatSummary';
import {
  readDayRecords,
  readRecentMoments,
  readUserPlans,
  writeDayRecords,
  writeRecentMoments,
  writeUserPlans,
} from '../utils/dayStateStorage';

export function useCheDayState() {
  const [now, setNow] = useState(() => Date.now());
  const todayKey = toDateKey(new Date(now));
  const [userPlans, setUserPlans] = useState<UserPlan[]>(() => readUserPlans());
  const restoredActivePlan = findActiveSharedPlanForDate(userPlans, todayKey);
  const [activeActivityId, setActiveActivityId] = useState<string | null>(
    () => restoredActivePlan ? `scene-shared-${restoredActivePlan.id}` : null,
  );
  const [activeStartedAt, setActiveStartedAt] = useState<string | null>(() => restoredActivePlan?.updatedAt ?? null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [runtimeCheScheduleItems, setRuntimeCheScheduleItems] = useState<CheScheduleItem[]>(
    () => restoreRuntimeCheSchedule(userPlans),
  );
  const [sceneCards, setSceneCards] = useState<SceneCard[]>(() => restoreSceneCards(userPlans, todayKey));
  const [dayRecords, setDayRecords] = useState<DayRecord[]>(() => readDayRecords());
  const [recentMoments, setRecentMoments] = useState<RecentMoment[]>(() => readRecentMoments());

  useEffect(() => {
    const timerId = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => writeUserPlans(userPlans), [userPlans]);
  useEffect(() => writeDayRecords(dayRecords), [dayRecords]);
  useEffect(() => writeRecentMoments(recentMoments), [recentMoments]);

  useEffect(() => {
    setSceneCards((currentCards) => restoreSceneCards(
      userPlans,
      todayKey,
      currentCards.filter((card) => card.linkedPlanId === null),
    ));
  }, [todayKey, userPlans]);

  useEffect(() => {
    const activePlanForToday = findActiveSharedPlanForDate(userPlans, todayKey);
    const isCurrentActivityShared = activeActivityId?.startsWith('scene-shared-') ?? false;

    if (isCurrentActivityShared) {
      const nextActivityId = activePlanForToday ? `scene-shared-${activePlanForToday.id}` : null;
      if (nextActivityId !== activeActivityId) setActiveActivityId(nextActivityId);
      setActiveStartedAt(activePlanForToday?.updatedAt ?? null);
      return;
    }

    if (!activeActivityId && activePlanForToday) {
      setActiveActivityId(`scene-shared-${activePlanForToday.id}`);
      setActiveStartedAt(activePlanForToday.updatedAt);
    }
  }, [activeActivityId, todayKey, userPlans]);

  const selectedPlan = userPlans.find((plan) => plan.id === selectedPlanId) ?? null;
  const cheSchedule = useMemo(
    () => mergeCheScheduleForDate(todayKey, runtimeCheScheduleItems),
    [runtimeCheScheduleItems, todayKey],
  );
  const getCheScheduleForDate = useCallback(
    (dateKey: string) => mergeCheScheduleForDate(dateKey, runtimeCheScheduleItems),
    [runtimeCheScheduleItems],
  );

  const derivedState = useCheDayDerivedState({
    activeActivityId,
    activeStartedAt,
    cheSchedule,
    dayRecords,
    now,
    sceneCards,
    userPlans,
  });

  const updateRecentMoments = (updater: (currentMoments: RecentMoment[]) => RecentMoment[]) => {
    setRecentMoments(updater);
  };

  const handleAddPlan = (input: string, selectedDateKey?: string) => {
    const nextPlan = createUserPlanFromInput(input, new Date(), selectedDateKey);
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
      status: 'todo',
      inviteReply: getCheInviteReply(plan),
      updatedAt: new Date().toISOString(),
    };

    setUserPlans((currentPlans) => currentPlans.map((item) => (item.id === planId ? acceptedPlan : item)));

    if (getUserPlanDateKey(acceptedPlan) === todayKey) {
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
    }

    setRuntimeCheScheduleItems((currentSchedule) => {
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
    setActiveStartedAt(startedAt);

    setSceneCards((currentCards) =>
      currentCards.map((item) => (item.id === card.id ? activeCard : item.status === 'active' ? { ...item, status: 'scheduled', timeLabel: item.timeHint } : item)),
    );

    if (card.linkedPlanId) {
      setUserPlans((currentPlans) =>
        currentPlans.map((plan) => (plan.id === card.linkedPlanId ? { ...plan, status: 'active', updatedAt: startedAt } : plan)),
      );
    }

    setRuntimeCheScheduleItems((currentSchedule) => syncCheScheduleForActive(currentSchedule, activeCard, startedAt));
    updateRecentMoments((currentMoments) =>
      addUniqueMoment(currentMoments, createMoment({
        id: `moment-active-${card.id}`,
        text: getActiveMomentText(card),
        sourceScene: card.sceneType,
        linkedPlanId: card.linkedPlanId,
      })),
    );
  };

  const completeActivity = (card: SceneCard, hasChat = false) => {
    const completedAt = new Date().toISOString();
    const completedCard = { ...card, status: 'completed' as const, timeLabel: '已完成', timePrecision: 'period' as const };
    const startedAt = activeStartedAt;

    setSceneCards((currentCards) => currentCards.map((item) => (item.id === card.id ? completedCard : item)));

    if (card.linkedPlanId) {
      setUserPlans((currentPlans) =>
        currentPlans.map((plan) => (plan.id === card.linkedPlanId ? { ...plan, status: 'done', updatedAt: completedAt } : plan)),
      );
    }

    if (activeActivityId === card.id) {
      setActiveActivityId(null);
      setActiveStartedAt(null);
    }

    setRuntimeCheScheduleItems((currentSchedule) => completeCheScheduleForActivity(currentSchedule, card));

    setDayRecords((currentRecords) => addUniqueRecord(currentRecords, createActivityRecord(card, startedAt, completedAt)));
    updateRecentMoments((currentMoments) =>
      addUniqueMoment(currentMoments, createMoment({
        id: `moment-completed-${card.id}`,
        text: hasChat ? getCompletedChatMomentText(card) : `你们完成了${card.title}。`,
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
      });
    }

    return nextCard;
  };

  const updatePlan = (planId: string, updates: Partial<UserPlan>) => {
    const nextUpdates = { ...updates, updatedAt: new Date().toISOString() };
    const currentPlan = userPlans.find((plan) => plan.id === planId);
    const updatedPlan = currentPlan ? { ...currentPlan, ...nextUpdates } : null;
    setUserPlans((currentPlans) => currentPlans.map((plan) => (plan.id === planId ? { ...plan, ...nextUpdates } : plan)));
    setSceneCards((currentCards) =>
      currentCards.map((card) =>
        card.linkedPlanId === planId
          ? { ...card, timeHint: updates.timeLabel ?? card.timeHint, timeLabel: updates.timeLabel ?? card.timeLabel, timePrecision: updates.timePrecision ?? card.timePrecision }
          : card,
      ),
    );
    setRuntimeCheScheduleItems((currentSchedule) =>
      currentSchedule.map((item) =>
        item.linkedPlanId === planId
          ? updatedPlan && item.source === 'user_invite'
            ? { ...createCheScheduleItemFromPlan(updatedPlan), id: item.id }
            : { ...item, startTime: updates.startTime ?? item.startTime, timeLabel: updates.timeLabel ?? item.timeLabel, timePrecision: updates.timePrecision ?? item.timePrecision, title: updates.title ?? item.title }
          : item,
      ),
    );
  };

  const cancelInvite = (planId: string) => {
    if (derivedState.activeActivityCard?.linkedPlanId === planId) {
      setActiveActivityId(null);
      setActiveStartedAt(null);
    }
    updatePlan(planId, { inviteStatus: 'not_invited', status: 'todo' });
    setRuntimeCheScheduleItems((currentSchedule) => currentSchedule.filter((item) => item.linkedPlanId !== planId));
    setSceneCards((currentCards) => currentCards.filter((card) => card.linkedPlanId !== planId));
  };

  const completePlan = (planId: string) => {
    const relatedCard = sceneCards.find((card) => card.linkedPlanId === planId);
    if (relatedCard) {
      completeActivity(relatedCard);
      setSelectedPlanId(null);
      return;
    }
    updatePlan(planId, { status: 'done' });
    setSelectedPlanId(null);
  };

  const restoreTodo = (planId: string) => {
    const plan = userPlans.find((item) => item.id === planId);
    if (!plan) return;
    const restoredPlan: UserPlan = { ...plan, status: 'todo', updatedAt: new Date().toISOString() };
    setUserPlans((currentPlans) => currentPlans.map((item) => (item.id === planId ? restoredPlan : item)));
    setRuntimeCheScheduleItems((currentSchedule) => restoreCheScheduleItemFromPlan(currentSchedule, restoredPlan));
    setSceneCards((currentCards) =>
      currentCards.map((card) => (card.linkedPlanId === planId && card.status === 'completed' ? { ...card, status: 'scheduled', timeLabel: card.timeHint } : card)),
    );
  };

  const deletePlan = (planId: string) => {
    if (derivedState.activeActivityCard?.linkedPlanId === planId) {
      setActiveActivityId(null);
      setActiveStartedAt(null);
    }
    setUserPlans((currentPlans) => currentPlans.filter((plan) => plan.id !== planId));
    setRuntimeCheScheduleItems((currentSchedule) => currentSchedule.filter((item) => item.linkedPlanId !== planId));
    setSceneCards((currentCards) => currentCards.filter((card) => card.linkedPlanId !== planId));
    setSelectedPlanId(null);
  };

  const cancelSceneCard = (cardId: string) => {
    setSceneCards((currentCards) =>
      currentCards.map((card) => (card.id === cardId ? { ...card, status: 'disabled', timeLabel: '已取消' } : card)),
    );
  };

  const recordEndedChat = (
    session: StoredChatSession,
    scene: SceneData,
    linkedPlanId: string | null,
  ): Promise<EndedChatProcessingResult | null> => {
    if (!session.messages.some((message) => message.role === 'user')) return Promise.resolve(null);
    const endedAt = new Date();
    const fallback = createChatSummaryFallback(session.messages, scene.id);
    const record: DayRecord = {
      id: `record-${session.id}`,
      dateKey: toDateKey(endedAt),
      owner: 'mine',
      kind: 'letter',
      title: fallback.topicTitle,
      timeLabel: formatClockTime(endedAt),
      summary: fallback.summary,
      detail: formatChatTranscript(session.messages),
      sceneType: scene.id,
      linkedPlanId,
      startedAt: formatClockTime(new Date(session.createdAt)),
      endedAt: formatClockTime(endedAt),
    };
    setDayRecords((currentRecords) => addUniqueRecord(currentRecords, record));

    return summarizeEndedChat({
      sceneTitle: scene.shortTitle,
      messages: session.messages.map(({ role, text }) => ({ role, text })),
    })
      .then((summary) => {
        setDayRecords((currentRecords) => applyChatSummaryToRecord(currentRecords, record.id, summary));
        return { recordId: record.id, dateKey: record.dateKey, summary };
      })
      .catch(() => {
        // The saved fallback remains the truthful history when summary service is unavailable.
        return null;
      });
  };

  return {
    ...derivedState,
    activeActivityId,
    activeStartedAt,
    cancelInvite,
    cancelSceneCard,
    cheSchedule,
    completeActivity,
    completePlan,
    dayRecords,
    deletePlan,
    handleAddPlan,
    handleInvitePlan,
    getCheScheduleForDate,
    activateActivity,
    now,
    recentMoments,
    recordEndedChat,
    restoreTodo,
    sceneCards,
    selectedPlan,
    setSelectedPlanId,
    updateActivityTime,
    updatePlan,
    userPlans,
  };
}

export type CheDayState = ReturnType<typeof useCheDayState>;

function getCompletedChatMomentText(card: SceneCard) {
  switch (card.sceneType) {
    case 'meal':
      return '你们边吃饭边聊了几句，饭也好好吃完了。';
    case 'fitness':
      return '你们一起收了尾，他提醒你别忘了拉伸。';
    case 'study':
      return '你们安静陪了一段，也简单说了几句。';
    case 'watch':
      return '你们看完一段，也顺手聊了几句剧情。';
    case 'deep_room':
      return '安静聊聊里的那段话被好好收住了。';
    default:
      return `你们完成了${card.title}，也聊了几句。`;
  }
}

function restoreSceneCards(
  plans: UserPlan[],
  todayKey: string,
  baseCards: SceneCard[] = mockSceneCards,
): SceneCard[] {
  const sharedCards = plans
    .filter((plan) => (
      plan.inviteStatus === 'accepted'
      && plan.status !== 'cancelled'
      && getUserPlanDateKey(plan) === todayKey
    ))
    .map((plan, index) => {
      const card = createSharedSceneFromPlan(plan, index + 1);
      if (plan.status === 'done') return { ...card, status: 'completed' as const, timeLabel: '已完成' };
      if (plan.status === 'active') return { ...card, status: 'active' as const, timeLabel: '进行中' };
      return card;
    });
  return [
    ...sharedCards,
    ...baseCards.map((card, index) => ({ ...card, sortOrder: sharedCards.length + index + 1 })),
  ];
}

function findActiveSharedPlanForDate(plans: UserPlan[], dateKey: string): UserPlan | undefined {
  return plans.find((plan) => (
    plan.status === 'active'
    && plan.inviteStatus === 'accepted'
    && getUserPlanDateKey(plan) === dateKey
  ));
}

function restoreRuntimeCheSchedule(plans: UserPlan[]): CheScheduleItem[] {
  let schedule = plans
    .filter((plan) => plan.inviteStatus === 'accepted' && plan.status !== 'cancelled')
    .map((plan) => {
      const item = createCheScheduleItemFromPlan(plan);
      return plan.status === 'done' ? { ...item, status: 'completed' as const } : item;
    });

  plans
    .filter((plan) => plan.inviteStatus === 'accepted' && plan.status === 'active')
    .forEach((plan) => {
      const card = { ...createSharedSceneFromPlan(plan), status: 'active' as const };
      schedule = syncCheScheduleForActive(schedule, card, plan.updatedAt);
    });
  return schedule;
}

function formatClockTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}
