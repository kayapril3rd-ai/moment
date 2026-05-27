import { useEffect, useState } from 'react';
import { mockCheSchedule, mockDayRecords, mockSceneCards, mockUserPlans } from '../data';
import type { CheScheduleItem, DayRecord, RecentMoment, SceneCard, SceneType, UserPlan } from '../types/che';
import {
  addUniqueMoment,
  addUniqueRecord,
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
} from '../utils/plan';
import { useCheDayDerivedState } from './useCheDayDerivedState';

interface UseCheDayStateInput {
  recentMoments: RecentMoment[];
  onRecentMomentsChange: (moments: RecentMoment[]) => void;
}

export function useCheDayState({ recentMoments, onRecentMomentsChange }: UseCheDayStateInput) {
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  const [activeScene, setActiveScene] = useState<SceneType | null>(null);
  const [activeStartedAt, setActiveStartedAt] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<UserPlan | null>(null);
  const [userPlans, setUserPlans] = useState<UserPlan[]>(mockUserPlans);
  const [cheSchedule, setCheSchedule] = useState<CheScheduleItem[]>(mockCheSchedule);
  const [sceneCards, setSceneCards] = useState<SceneCard[]>(mockSceneCards);
  const [dayRecords, setDayRecords] = useState<DayRecord[]>(mockDayRecords);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!activeStartedAt) return undefined;
    const timerId = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timerId);
  }, [activeStartedAt]);

  const derivedState = useCheDayDerivedState({
    activeActivityId,
    activeStartedAt,
    dayRecords,
    now,
    sceneCards,
    userPlans,
  });

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

    return nextCard;
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
    if (derivedState.activeActivityCard?.linkedPlanId === planId) {
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
    if (derivedState.activeActivityCard?.linkedPlanId === planId) {
      setActiveActivityId(null);
      setActiveScene(null);
      setActiveStartedAt(null);
    }
    setUserPlans((currentPlans) => currentPlans.filter((plan) => plan.id !== planId));
    setCheSchedule((currentSchedule) => currentSchedule.filter((item) => item.linkedPlanId !== planId));
    setSceneCards((currentCards) => currentCards.filter((card) => card.linkedPlanId !== planId));
    setSelectedPlan(null);
  };

  const cancelSceneCard = (cardId: string) => {
    setSceneCards((currentCards) =>
      currentCards.map((card) => (card.id === cardId ? { ...card, status: 'disabled', timeLabel: '已取消' } : card)),
    );
  };

  return {
    ...derivedState,
    activeActivityId,
    activeScene,
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
    activateActivity,
    now,
    restoreTodo,
    sceneCards,
    selectedPlan,
    setSelectedPlan,
    updateActivityTime,
    updatePlan,
    userPlans,
  };
}
