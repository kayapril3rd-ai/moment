import assert from 'node:assert/strict';
import { buildCheScheduleForDate } from '../src/data/cheSchedule.ts';
import { formatCheCurrentStateForAgent, resolveCheCurrentState } from '../src/utils/cheCurrentState.ts';

const weekdayKey = '2026-08-27';
const weekendKey = '2026-08-29';
const weekdaySchedule = buildCheScheduleForDate(weekdayKey);
const repeatedWeekdaySchedule = buildCheScheduleForDate(weekdayKey);
const weekendSchedule = buildCheScheduleForDate(weekendKey);

assert.deepEqual(weekdaySchedule, repeatedWeekdaySchedule, 'same dateKey must produce the same schedule');

const weekdayExpectations = [
  ['09:00', 'focus'],
  ['10:30', 'focus'],
  ['12:30', 'meal'],
  ['15:00', 'focus'],
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

console.log(JSON.stringify({
  deterministic: true,
  weekdayKey,
  weekdaySchedule: summarizeSchedule(weekdaySchedule),
  weekdayStates: summarizeStates(weekdayStates),
  weekendKey,
  weekendSchedule: summarizeSchedule(weekendSchedule),
  weekendStates: summarizeStates(weekendStates),
  defaultState: summarizeState(defaultState),
  sharedState: summarizeState(sharedState),
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
