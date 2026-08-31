import assert from 'node:assert/strict';
import { buildCheScheduleForDate } from '../src/data/cheSchedule.ts';
import { formatCheCurrentStateForAgent, resolveCheCurrentState } from '../src/utils/cheCurrentState.ts';
import { getCheScheduleForDate } from '../src/utils/cheSchedule.ts';
import { getSceneImage, getWorldSceneImage } from '../src/utils/sceneImages.ts';
import { buildChatRuntimeContext } from '../src/utils/agentSceneContext.ts';
import {
  createCheScheduleItemFromPlan,
  createSharedSceneFromPlan,
  createUserPlanFromInput,
  getUserPlanDateKey,
  restoreCheScheduleItemFromPlan,
} from '../src/utils/plan.ts';
import { completeCheScheduleForActivity, syncCheScheduleForActive } from '../src/utils/activityState.ts';
import { mockSceneCards, sceneRegistry } from '../src/data/mockScenes.ts';
import type { CheScheduleItem, SceneCard, UserPlan } from '../src/types/che.ts';

const weekdayKey = '2026-08-27';
const weekendKey = '2026-08-29';
const weekdaySchedule = buildCheScheduleForDate(weekdayKey);
const repeatedWeekdaySchedule = buildCheScheduleForDate(weekdayKey);
const weekendSchedule = buildCheScheduleForDate(weekendKey);

assert.deepEqual(weekdaySchedule, repeatedWeekdaySchedule, 'same dateKey must produce the same schedule');

const morningState = resolveAt(weekdayKey, '08:00', weekdaySchedule);
assert.deepEqual(morningState.worldScene, { sceneKey: 'home_idle', sceneVariant: 'home_day' });

const weekdayExpectations = [
  ['09:00', 'focus'],
  ['10:30', 'focus'],
  ['12:30', 'meal'],
  ['15:30', 'focus'],
  ['18:00', 'commute'],
  ['20:30', weekdaySchedule.find((item) => item.startTime === '19:30')?.worldScene.sceneKey],
  ['23:00', 'home_idle'],
] as const;

const weekendExpectations = [
  ['09:00', 'home_idle'],
  ['11:30', 'meal'],
  ['15:00', weekendSchedule.find((item) => item.startTime === '14:00')?.worldScene.sceneKey],
  ['19:00', 'meal'],
  ['21:00', 'home_idle'],
] as const;

const weekdayStates = weekdayExpectations.map(([time, expectedSceneKey]) => {
  const state = resolveAt(weekdayKey, time, weekdaySchedule);
  assert.equal(state.source, 'schedule');
  assert.equal(state.worldScene.sceneKey, expectedSceneKey);
  return { time, state, agentText: formatCheCurrentStateForAgent(state) };
});

const weekendStates = weekendExpectations.map(([time, expectedSceneKey]) => {
  const state = resolveAt(weekendKey, time, weekendSchedule);
  assert.equal(state.source, 'schedule');
  assert.equal(state.worldScene.sceneKey, expectedSceneKey);
  return { time, state, agentText: formatCheCurrentStateForAgent(state) };
});

const defaultState = resolveAt(weekdayKey, '19:00', weekdaySchedule);
assert.equal(defaultState.source, 'default_rhythm');
assert.equal(defaultState.worldScene.sceneKey, 'home_idle');
const daytimeDefaultState = resolveAt(weekdayKey, '13:15', weekdaySchedule);
assert.deepEqual(daytimeDefaultState.worldScene, { sceneKey: 'home_idle', sceneVariant: 'home_day' });

const sharedCard = {
  id: 'verify-shared-card',
  sceneType: 'gaming',
  title: '一起打游戏',
  timeHint: '现在',
  description: '你们正在家里玩一局。',
  status: 'active',
  linkedPlanId: null,
  sortOrder: 0,
} as const;
const sharedState = resolveCheCurrentState({
  now: at(weekdayKey, '10:30'),
  cheSchedule: weekdaySchedule,
  activeActivityCard: sharedCard,
  activeStartedAt: `${weekdayKey}T10:20:00`,
});
assert.equal(sharedState.source, 'shared_activity');
assert.equal(sharedState.worldScene.sceneKey, 'home_idle');
assert.equal(sharedState.worldScene.sceneVariant, 'gaming_sofa');
assert.equal(sharedState.availability, 'available');
const temporaryActiveSchedule = syncCheScheduleForActive([], sharedCard, `${weekdayKey}T10:20:00`);
assert.equal(temporaryActiveSchedule[0].status, 'active');
assert.deepEqual(completeCheScheduleForActivity(temporaryActiveSchedule, sharedCard), []);

const scheduledFitnessCard: SceneCard = {
  id: 'verify-scheduled-fitness',
  sceneType: 'fitness',
  title: '一起健身',
  timeHint: '20:10 左右',
  description: '想一起动一动时，可以从这里开始。',
  status: 'scheduled',
  linkedPlanId: 'verify-fitness-plan',
  sortOrder: 1,
};
const activeCard = [scheduledFitnessCard].find((card) => card.status === 'active') ?? null;
const commuteWithScheduledCard = resolveCheCurrentState({
  now: at(weekdayKey, '18:00'),
  cheSchedule: weekdaySchedule,
  activeActivityCard: activeCard,
});
assert.equal(commuteWithScheduledCard.worldScene.sceneKey, 'commute', 'a scheduled card must not override current world state');
assert.equal(commuteWithScheduledCard.worldScene.sceneVariant, 'city_evening');

const futureKey = '2026-08-28';
const futureSchedule = getCheScheduleForDate(futureKey, []);
assert.ok(futureSchedule.length > 0);
assert.ok(futureSchedule.every((item) => item.dateKey === futureKey), 'Arrange must derive the selected date schedule');

const idleVisual = getSceneImage('idle');
const parkVisual = getWorldSceneImage({ sceneKey: 'hangout', sceneVariant: 'park' }, null);
const seasideVisual = getWorldSceneImage({ sceneKey: 'hangout', sceneVariant: 'seaside' }, null);
const groceryVisual = getWorldSceneImage({ sceneKey: 'errand', sceneVariant: 'grocery' }, null);
for (const [name, visual] of [['park', parkVisual], ['seaside', seasideVisual], ['grocery', groceryVisual]] as const) {
  assert.notEqual(visual.heroImage, idleVisual.heroImage, `${name} hero visual must not use idle/sofa`);
  assert.notEqual(visual.arrangeSrc, idleVisual.arrangeSrc, `${name} schedule visual must not use idle/sofa`);
}

const seasideWorldOnlyItem: CheScheduleItem = {
  id: 'verify-world-only-seaside',
  dateKey: weekdayKey,
  title: '在海边散步',
  startTime: '14:00',
  endTime: '17:00',
  timeLabel: '14:00–17:00',
  type: 'life',
  source: 'che',
  sceneType: null,
  worldScene: { sceneKey: 'hangout', sceneVariant: 'seaside' },
  linkedPlanId: null,
  detail: '在海边慢慢走一会儿。',
};
const seasideWorldOnlyState = resolveCheCurrentState({
  now: at(weekdayKey, '15:00'),
  cheSchedule: [seasideWorldOnlyItem],
  activeActivityCard: null,
});
assert.equal(seasideWorldOnlyState.entrySceneType, 'idle');
assert.deepEqual(seasideWorldOnlyState.worldScene, { sceneKey: 'hangout', sceneVariant: 'seaside' });
const seasideWorldOnlyContext = buildChatRuntimeContext(sceneRegistry.idle, seasideWorldOnlyState);
assert.deepEqual(
  { sceneKey: seasideWorldOnlyContext.sceneKey, sceneVariant: seasideWorldOnlyContext.sceneVariant },
  { sceneKey: 'hangout', sceneVariant: 'seaside' },
);

const moviePlan = requirePlan(createUserPlanFromInput('20:00 看电影', at(weekdayKey, '09:00'), weekdayKey));
const acceptedMoviePlan: UserPlan = { ...moviePlan, durationMinutes: 90, inviteStatus: 'accepted' };
const movieScheduleItem = createCheScheduleItemFromPlan(acceptedMoviePlan);
assert.equal(movieScheduleItem.startTime, '20:00');
assert.equal(movieScheduleItem.endTime, '21:30');
assert.deepEqual(movieScheduleItem.worldScene, { sceneKey: 'home_idle', sceneVariant: 'movie_night' });
assert.equal(movieScheduleItem.status, 'planned');
assert.match(movieScheduleItem.title, /^等你/);
assert.doesNotMatch(movieScheduleItem.title, /正在/);

const futureAcceptedPlan: UserPlan = {
  ...acceptedMoviePlan,
  id: 'verify-future-accepted-plan',
  dateKey: futureKey,
};
const legacyTodayPlan: UserPlan = {
  ...acceptedMoviePlan,
  id: 'verify-legacy-today-plan',
  dateKey: undefined,
  createdAt: `${weekdayKey}T09:00:00+08:00`,
};
assert.equal(getUserPlanDateKey(legacyTodayPlan), weekdayKey, 'legacy plan date must fall back to createdAt');
const scopedTodayPlans = [acceptedMoviePlan, futureAcceptedPlan, legacyTodayPlan]
  .filter((plan) => getUserPlanDateKey(plan) === weekdayKey);
assert.deepEqual(
  scopedTodayPlans.map((plan) => plan.id),
  [acceptedMoviePlan.id, legacyTodayPlan.id],
  'Today plan consumers must exclude accepted plans from another date',
);
const restoredActiveTomorrow = [
  { ...acceptedMoviePlan, status: 'active' as const },
  { ...futureAcceptedPlan, status: 'active' as const },
].find((plan) => getUserPlanDateKey(plan) === futureKey);
assert.equal(restoredActiveTomorrow?.id, futureAcceptedPlan.id, 'active shared plan restoration must use the current date');
const futureSharedSchedule = getCheScheduleForDate(futureKey, [createCheScheduleItemFromPlan(futureAcceptedPlan)]);
assert.ok(
  futureSharedSchedule.some((item) => item.linkedPlanId === futureAcceptedPlan.id),
  'a future accepted plan must remain available in its Arrange schedule',
);

const scheduleWithMovie = getCheScheduleForDate(weekdayKey, [movieScheduleItem]);
assert.ok(scheduleWithMovie.includes(movieScheduleItem));
assert.ok(
  !scheduleWithMovie.some((item) => item.source === 'che' && item.startTime === '19:30' && item.endTime === '21:30'),
  'exact shared item must remove an overlapping deterministic base item',
);
const waitingForMovieState = resolveAt(weekdayKey, '20:30', scheduleWithMovie);
assert.equal(waitingForMovieState.source, 'schedule');
assert.deepEqual(waitingForMovieState.worldScene, { sceneKey: 'home_idle', sceneVariant: 'movie_night' });

const movieCard = { ...createSharedSceneFromPlan(acceptedMoviePlan), status: 'active' as const };
const activeMovieState = resolveCheCurrentState({
  now: at(weekdayKey, '20:30'),
  cheSchedule: scheduleWithMovie,
  activeActivityCard: movieCard,
  activeStartedAt: `${weekdayKey}T20:25:00`,
});
assert.equal(activeMovieState.source, 'shared_activity');
assert.deepEqual(activeMovieState.worldScene, { sceneKey: 'home_idle', sceneVariant: 'movie_night' });

const partialPlan = requirePlan(createUserPlanFromInput('16:30 看电影', at(weekdayKey, '09:00'), weekdayKey));
const partialSharedItem = createCheScheduleItemFromPlan({ ...partialPlan, durationMinutes: 30, inviteStatus: 'accepted' });
const partialSchedule = getCheScheduleForDate(weekdayKey, [partialSharedItem]);
const truncatedFocus = partialSchedule.find((item) => item.source === 'che' && item.startTime === '13:30');
assert.ok(truncatedFocus);
assert.equal(truncatedFocus.endTime, '16:30');
assert.equal(truncatedFocus.timeLabel, '13:30–16:30');
assert.match(truncatedFocus.id, /-before-shared$/);
assert.deepEqual(resolveAt(weekdayKey, '15:00', partialSchedule).worldScene, { sceneKey: 'focus', sceneVariant: 'work_desk' });
assert.deepEqual(resolveAt(weekdayKey, '16:45', partialSchedule).worldScene, { sceneKey: 'home_idle', sceneVariant: 'movie_night' });
const afterPartialSharedState = resolveAt(weekdayKey, '17:15', partialSchedule);
assert.equal(afterPartialSharedState.source, 'default_rhythm');
assert.notEqual(afterPartialSharedState.worldScene.sceneKey, 'focus');

const activeMovieRuntime = syncCheScheduleForActive(
  [movieScheduleItem],
  movieCard,
  `${weekdayKey}T20:30:00`,
);
assert.equal(activeMovieRuntime[0].status, 'active');
assert.equal(activeMovieRuntime[0].startTime, movieScheduleItem.startTime);
assert.equal(activeMovieRuntime[0].endTime, movieScheduleItem.endTime);
const activeMovieTimeline = getCheScheduleForDate(weekdayKey, activeMovieRuntime);
const activeMovieAt2030 = resolveCheCurrentState({
  now: at(weekdayKey, '20:30'),
  cheSchedule: activeMovieTimeline,
  activeActivityCard: movieCard,
  activeStartedAt: `${weekdayKey}T20:30:00`,
});
assert.equal(activeMovieAt2030.source, 'shared_activity');

const completedMovieRuntime = completeCheScheduleForActivity(activeMovieRuntime, movieCard);
assert.equal(completedMovieRuntime.length, 1);
assert.equal(completedMovieRuntime[0].status, 'completed');
for (const field of ['startTime', 'endTime', 'dateKey', 'worldScene', 'linkedPlanId'] as const) {
  assert.deepEqual(completedMovieRuntime[0][field], movieScheduleItem[field], `completed item must preserve ${field}`);
}
const completedMovieTimeline = getCheScheduleForDate(weekdayKey, completedMovieRuntime);
assert.ok(completedMovieTimeline.some((item) => item.id === movieScheduleItem.id && item.status === 'completed'));
assert.ok(completedMovieTimeline.some((item) => item.source === 'che' && item.startTime === '19:30' && item.endTime === '20:00'));
const afterCompletedMovieState = resolveAt(weekdayKey, '20:41', completedMovieTimeline);
assert.equal(afterCompletedMovieState.source, 'default_rhythm');
assert.notEqual(afterCompletedMovieState.worldScene.sceneKey, 'hangout');
assert.notEqual(afterCompletedMovieState.scheduleItemId, movieScheduleItem.id);

const restoredMoviePlan: UserPlan = { ...acceptedMoviePlan, status: 'todo' };
const restoredMovieRuntime = restoreCheScheduleItemFromPlan(completedMovieRuntime, restoredMoviePlan);
assert.equal(restoredMovieRuntime.length, 1);
assert.equal(restoredMovieRuntime[0].id, completedMovieRuntime[0].id, 'restore must preserve the runtime schedule item id');
assert.equal(restoredMovieRuntime[0].status, 'planned');
assert.equal(restoredMovieRuntime[0].source, 'user_invite');
const restoredMovieState = resolveAt(
  weekdayKey,
  '20:30',
  getCheScheduleForDate(weekdayKey, restoredMovieRuntime),
);
assert.equal(restoredMovieState.source, 'schedule');
assert.deepEqual(restoredMovieState.worldScene, { sceneKey: 'home_idle', sceneVariant: 'movie_night' });
assert.deepEqual(
  restoreCheScheduleItemFromPlan([], { ...restoredMoviePlan, inviteStatus: 'not_invited' }),
  [],
  'restore must not create a runtime reservation without an accepted invite',
);

const cancelledMovieRuntime = completedMovieRuntime.filter((item) => item.linkedPlanId !== acceptedMoviePlan.id);
const scheduleAfterCancel = getCheScheduleForDate(weekdayKey, cancelledMovieRuntime);
const restoredBaseState = resolveAt(weekdayKey, '20:41', scheduleAfterCancel);
assert.deepEqual(restoredBaseState.worldScene, { sceneKey: 'hangout', sceneVariant: 'park' });

const parkPlan = verifyPlanWorldScene('20:00 公园散步', 'idle', { sceneKey: 'hangout', sceneVariant: 'park' });
const seasidePlan = verifyPlanWorldScene('20:00 海边走走', 'idle', { sceneKey: 'hangout', sceneVariant: 'seaside' });
const groceryPlan = verifyPlanWorldScene('20:00 去超市买日用品', 'idle', { sceneKey: 'errand', sceneVariant: 'grocery' });
for (const plan of [parkPlan, seasidePlan, groceryPlan]) {
  const item = createCheScheduleItemFromPlan({ ...plan, inviteStatus: 'accepted' });
  assert.deepEqual(item.worldScene, plan.worldScene, 'plan worldScene must survive schedule creation');
}
const parkCard = createSharedSceneFromPlan({ ...parkPlan, inviteStatus: 'accepted' });
assert.deepEqual(parkCard.worldSceneOverride, { sceneKey: 'hangout', sceneVariant: 'park' });
const parkScheduleItem = createCheScheduleItemFromPlan({ ...parkPlan, inviteStatus: 'accepted' });
const activeParkSchedule = syncCheScheduleForActive([parkScheduleItem], { ...parkCard, status: 'active' }, `${weekdayKey}T20:05:00`);
assert.equal(activeParkSchedule[0].source, 'shared_activity');
assert.deepEqual(activeParkSchedule[0].worldScene, { sceneKey: 'hangout', sceneVariant: 'park' });
const activeParkState = resolveCheCurrentState({
  now: at(weekdayKey, '20:30'),
  cheSchedule: weekdaySchedule,
  activeActivityCard: { ...parkCard, status: 'active' },
});
assert.deepEqual(activeParkState.worldScene, { sceneKey: 'hangout', sceneVariant: 'park' });

const currentFocusState = resolveAt(weekdayKey, '10:30', weekdaySchedule);
const studyChatContext = buildChatRuntimeContext(sceneRegistry.study, currentFocusState);
assert.deepEqual(
  { chatMode: studyChatContext.chatMode, sceneKey: studyChatContext.sceneKey, sceneVariant: studyChatContext.sceneVariant },
  { chatMode: 'scene', sceneKey: 'focus', sceneVariant: 'work_desk' },
);
assert.equal(studyChatContext.cheCurrentState, formatCheCurrentStateForAgent(currentFocusState));

const parkChatContext = buildChatRuntimeContext(sceneRegistry.idle, activeParkState);
assert.deepEqual(
  { chatMode: parkChatContext.chatMode, sceneKey: parkChatContext.sceneKey, sceneVariant: parkChatContext.sceneVariant },
  { chatMode: 'scene', sceneKey: 'hangout', sceneVariant: 'park' },
);
assert.match(parkChatContext.cheCurrentState, /公园/);

const deepChatContext = buildChatRuntimeContext(sceneRegistry.deep_room, currentFocusState);
assert.deepEqual(
  { chatMode: deepChatContext.chatMode, sceneKey: deepChatContext.sceneKey, sceneVariant: deepChatContext.sceneVariant },
  { chatMode: 'deep', sceneKey: 'deep_room', sceneVariant: 'window_night' },
);
assert.equal(deepChatContext.cheCurrentState, formatCheCurrentStateForAgent(currentFocusState));
assert.match(deepChatContext.cheCurrentState, /书桌/);

const unrelatedWatchContext = buildChatRuntimeContext(sceneRegistry.watch, currentFocusState);
assert.deepEqual(
  { chatMode: unrelatedWatchContext.chatMode, sceneKey: unrelatedWatchContext.sceneKey, sceneVariant: unrelatedWatchContext.sceneVariant },
  { chatMode: 'scene', sceneKey: 'home_idle', sceneVariant: 'movie_night' },
);

const restPlan = requirePlan(createUserPlanFromInput('休息一下', at(weekdayKey, '09:00'), weekdayKey));
assert.equal(restPlan.sceneType, 'idle');
assert.deepEqual(restPlan.worldScene, { sceneKey: 'home_idle', sceneVariant: 'sofa_evening' });
for (const [input, sceneType, sceneKey, sceneVariant] of [
  ['学习', 'study', 'focus', 'work_desk'],
  ['健身训练', 'fitness', 'fitness', 'home_gym'],
  ['一起吃饭', 'meal', 'meal', 'cooking'],
  ['看剧', 'watch', 'home_idle', 'movie_night'],
  ['打游戏', 'gaming', 'home_idle', 'gaming_sofa'],
] as const) {
  const plan = requirePlan(createUserPlanFromInput(input, at(weekdayKey, '09:00'), weekdayKey));
  assert.equal(plan.sceneType, sceneType);
  assert.deepEqual(plan.worldScene, { sceneKey, sceneVariant });
}

for (const card of mockSceneCards.filter((item) => item.linkedPlanId === null)) {
  assert.equal(card.status, 'flexible', 'evergreen cards must remain suggestions');
  assert.doesNotMatch(`${card.timeHint} ${card.timeLabel ?? ''}`, /\d{1,2}:\d{2}|现在|睡前/);
}

console.log(JSON.stringify({
  deterministic: true,
  weekdayKey,
  weekdaySchedule: summarizeSchedule(weekdaySchedule),
  weekdayStates: summarizeStates(weekdayStates),
  weekendKey,
  weekendSchedule: summarizeSchedule(weekendSchedule),
  weekendStates: summarizeStates(weekendStates),
  defaultState: summarizeState(defaultState),
  daytimeDefaultState: summarizeState(daytimeDefaultState),
  sharedState: summarizeState(sharedState),
  scheduledCardDoesNotOverrideHero: summarizeState(commuteWithScheduledCard),
  futureScheduleDateKey: futureSchedule[0]?.dateKey,
  worldVisualOverrides: ['park', 'seaside', 'grocery'],
  worldOnlyHeroEntry: {
    entrySceneType: seasideWorldOnlyState.entrySceneType,
    worldScene: seasideWorldOnlyState.worldScene,
    chatContext: {
      sceneKey: seasideWorldOnlyContext.sceneKey,
      sceneVariant: seasideWorldOnlyContext.sceneVariant,
    },
  },
  acceptedMovieSchedule: summarizeSchedule(scheduleWithMovie),
  waitingForMovieState: summarizeState(waitingForMovieState),
  activeMovieState: summarizeState(activeMovieState),
  partialOverlapSchedule: summarizeSchedule(partialSchedule),
  afterPartialSharedState: summarizeState(afterPartialSharedState),
  completedMovieStatus: completedMovieRuntime[0].status,
  restoredMovieStatus: restoredMovieRuntime[0].status,
  afterCompletedMovieState: summarizeState(afterCompletedMovieState),
  baseRestoredAfterCancel: summarizeState(restoredBaseState),
  planWorldScenes: [parkPlan, seasidePlan, groceryPlan].map((plan) => `${plan.sceneType} -> ${plan.worldScene.sceneKey}/${plan.worldScene.sceneVariant}`),
  activeScheduleSource: activeParkSchedule[0].source,
  chatRuntimeContexts: {
    study: studyChatContext,
    activePark: parkChatContext,
    deep: deepChatContext,
    unrelatedWatch: unrelatedWatchContext,
  },
  evergreenCardsAreFlexible: true,
  formatterExamples: [
    weekdayStates[1].agentText,
    weekdayStates[5].agentText,
    formatCheCurrentStateForAgent(sharedState),
  ],
}, null, 2));

function summarizeSchedule(schedule: ReturnType<typeof buildCheScheduleForDate>) {
  return schedule.map((item) => `${item.startTime}-${item.endTime} ${item.worldScene.sceneKey}/${item.worldScene.sceneVariant} ${item.title}`);
}

function summarizeStates(states: Array<{ time: string; state: ReturnType<typeof resolveCheCurrentState> }>) {
  return states.map(({ time, state }) => `${time} ${state.source} ${state.worldScene.sceneKey}/${state.worldScene.sceneVariant} ${state.activity}`);
}

function summarizeState(state: ReturnType<typeof resolveCheCurrentState>) {
  return `${state.source} ${state.worldScene.sceneKey}/${state.worldScene.sceneVariant} ${state.activity}`;
}

function resolveAt(dateKey: string, time: string, cheSchedule: ReturnType<typeof buildCheScheduleForDate>) {
  return resolveCheCurrentState({
    now: at(dateKey, time),
    cheSchedule,
    activeActivityCard: null,
  });
}

function at(dateKey: string, time: string): Date {
  return new Date(`${dateKey}T${time}:00`);
}

function requirePlan(plan: UserPlan | null): UserPlan {
  assert.ok(plan);
  return plan;
}

function verifyPlanWorldScene(
  input: string,
  expectedSceneType: UserPlan['sceneType'],
  expectedWorldScene: UserPlan['worldScene'],
): UserPlan {
  const plan = requirePlan(createUserPlanFromInput(input, at(weekdayKey, '09:00'), weekdayKey));
  assert.equal(plan.sceneType, expectedSceneType);
  assert.deepEqual(plan.worldScene, expectedWorldScene);
  return plan;
}
