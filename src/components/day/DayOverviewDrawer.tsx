// DayOverviewDrawer 负责首页“我的今天 / 澈的今天”的只读查看抽屉。
// 它只做概览和查看；可编辑操作仍放在 schedule/ScheduleDrawer 和 PlanDetailSheet。
import type { CheScheduleItem, UserPlan } from '../../types/che';
import { getPlanTimeAnchor } from '../../utils/plan';

type DayOverviewType = 'user' | 'che';

interface DayOverviewDrawerProps {
  isOpen: boolean;
  type: DayOverviewType;
  userPlans: UserPlan[];
  cheSchedule: CheScheduleItem[];
  onClose: () => void;
  onManageToday: () => void;
}

interface UserOverviewRow {
  id: string;
  marker: string;
  title: string;
  time: string;
  note?: string;
}

interface CheOverviewRow {
  id: string;
  time: string;
  title: string;
  detail: string;
}

function getUserRows(plans: UserPlan[]) {
  const active = plans
    .filter((plan) => plan.status === 'active')
    .map((plan) => createUserRow(plan, '◐', '进行中'));
  const todo = plans
    .filter((plan) => !plan.status || plan.status === 'todo')
    .map((plan) => createUserRow(plan, '○'));
  const accepted = plans
    .filter((plan) => plan.inviteStatus === 'accepted' && plan.status !== 'active' && plan.status !== 'done' && plan.status !== 'cancelled')
    .map((plan) => createUserRow(plan, '●', '澈已答应'));
  const done = plans
    .filter((plan) => plan.status === 'done')
    .map((plan) => createUserRow(plan, '✓'));

  return { active, todo, accepted, done };
}

function createUserRow(plan: UserPlan, marker: string, note?: string): UserOverviewRow {
  return {
    id: plan.id,
    marker,
    title: plan.title,
    time: getPlanTimeAnchor(plan),
    note,
  };
}

function getCheRows(schedule: CheScheduleItem[]) {
  const workItem = schedule.find((item) => item.type === 'work') ?? schedule[0];
  const mealItem = schedule.find((item) => item.sceneType === 'meal') ?? schedule.find((item) => item.type === 'life');
  const sharedItem = schedule.find((item) => item.type === 'shared');

  return {
    now: workItem ? [createCheRow(workItem, workItem.timeLabel ?? workItem.startTime)] : [],
    later: mealItem ? [createCheRow(mealItem, mealItem.timeLabel ?? mealItem.startTime)] : [],
    evening: sharedItem
      ? [createCheRow(sharedItem, sharedItem.timeLabel ?? sharedItem.startTime)]
      : [
          {
            id: 'che-overview-evening-open',
            time: '20:30 后',
            title: '可能去散步',
            detail: '那会儿会空一点。',
          },
        ],
  };
}

function createCheRow(item: CheScheduleItem, time: string): CheOverviewRow {
  return {
    id: item.id,
    time,
    title: item.title,
    detail: item.detail,
  };
}

function UserOverviewList({ plans }: { plans: UserPlan[] }) {
  const groups = getUserRows(plans);

  return (
    <>
      <OverviewGroup title="进行中" rows={groups.active} />
      <OverviewGroup title="待做" rows={groups.todo} />
      <OverviewGroup title="已约好" rows={groups.accepted} />
      <OverviewGroup title="已完成" rows={groups.done} />
    </>
  );
}

function OverviewGroup({ title, rows }: { title: string; rows: UserOverviewRow[] }) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="day-overview-group" aria-labelledby={`day-group-${title}`}>
      <h3 id={`day-group-${title}`}>{title}</h3>
      <div className="day-overview-list">
        {rows.map((row) => (
          <article className="day-overview-row" key={row.id}>
            <span className="day-status-mark" aria-hidden="true">{row.marker}</span>
            <div>
              <p>
                {row.time ? <span>{row.time}</span> : null}
                {row.time ? ' ' : ''}
                {row.title}
              </p>
              {row.note ? <small>{row.note}</small> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CheOverviewList({ schedule }: { schedule: CheScheduleItem[] }) {
  const groups = getCheRows(schedule);

  return (
    <>
      <CheOverviewGroup title="现在" rows={groups.now} />
      <CheOverviewGroup title="稍后" rows={groups.later} />
      <CheOverviewGroup title="晚上" rows={groups.evening} />
    </>
  );
}

function CheOverviewGroup({ title, rows }: { title: string; rows: CheOverviewRow[] }) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="day-overview-group" aria-labelledby={`che-group-${title}`}>
      <h3 id={`che-group-${title}`}>{title}</h3>
      <div className="day-overview-list">
        {rows.map((row) => (
          <article className="day-overview-row che-day-row" key={row.id}>
            <span className="day-time-anchor">{row.time}</span>
            <div>
              <p>{row.title}</p>
              <small>{row.detail}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function DayOverviewDrawer({
  isOpen,
  type,
  userPlans,
  cheSchedule,
  onClose,
  onManageToday,
}: DayOverviewDrawerProps) {
  const title = type === 'user' ? '我的今天' : '澈的今天';

  return (
    <div className={`day-overview-layer ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
      <button className="day-overview-scrim" type="button" aria-label="关闭今日查看" onClick={onClose} />

      <section className="day-overview-drawer" role="dialog" aria-modal="true" aria-labelledby="day-overview-title">
        <div className="drawer-handle" aria-hidden="true" />

        <header className="drawer-header">
          <div>
            <h2 id="day-overview-title">{title}</h2>
          </div>
          <button className="drawer-close" type="button" aria-label="关闭" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="day-overview-content">
          {type === 'user' ? (
            <>
              <UserOverviewList plans={userPlans} />
              <button className="day-overview-manage" type="button" onClick={onManageToday}>
                去今日安排 &gt;
              </button>
            </>
          ) : (
            <CheOverviewList schedule={cheSchedule} />
          )}
        </div>
      </section>
    </div>
  );
}
