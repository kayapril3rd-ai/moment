// UserPlanList renders the manageable "我的" arrange tab.
// Invite remains one tap and plan details still open through the existing sheet.
import { FormEvent, useEffect, useRef, useState } from 'react';
import type { SceneType, UserPlan } from '../../types/che';
import { CalendarSoftIcon, ClockSoftIcon, DumbbellSoftIcon, PlanCardIcon, SproutIcon } from '../icons/SoftIcons';

interface UserPlanListProps {
  plans: UserPlan[];
  onAddPlan: (input: string) => boolean;
  onInvite: (planId: string) => void;
  onSelectPlan: (plan: UserPlan) => void;
}

const replyVisibleMs = 2200;

export function UserPlanList({ plans, onAddPlan, onInvite, onSelectPlan }: UserPlanListProps) {
  const [planInput, setPlanInput] = useState('');
  const [hint, setHint] = useState('');
  const [visibleReplyIds, setVisibleReplyIds] = useState<Set<string>>(() => new Set());
  const replyTimers = useRef<number[]>([]);

  useEffect(() => {
    return () => replyTimers.current.forEach((timerId) => window.clearTimeout(timerId));
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const didAdd = onAddPlan(planInput);

    if (!didAdd) {
      setHint('先写一件想做的小事就好。');
      return;
    }

    setPlanInput('');
    setHint('');
  };

  const handleInvite = (plan: UserPlan) => {
    if (plan.inviteStatus === 'accepted') return;
    onInvite(plan.id);
    setVisibleReplyIds((currentIds) => new Set(currentIds).add(plan.id));
    const timerId = window.setTimeout(() => {
      setVisibleReplyIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(plan.id);
        return nextIds;
      });
    }, replyVisibleMs);
    replyTimers.current.push(timerId);
  };

  return (
    <div className="schedule-panel my-arrange-panel">
      <form className="plan-input-row" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="new-plan-input">添加计划</label>
        <input
          id="new-plan-input"
          type="text"
          placeholder="想和澈一起做些什么？"
          value={planInput}
          onChange={(event) => {
            setPlanInput(event.target.value);
            if (hint) setHint('');
          }}
        />
        <button type="submit">添加</button>
      </form>
      {hint ? <p className="plan-input-hint">{hint}</p> : null}

      <h2 className="schedule-section-title">今日安排</h2>

      <div className="schedule-list my-schedule-list" aria-label="我的计划">
        {plans.map((plan) => {
          const isAccepted = plan.inviteStatus === 'accepted';
          const isReplyVisible = visibleReplyIds.has(plan.id) && Boolean(plan.inviteReply);
          const action = getPlanAction(plan);

          return (
            <article
              className="schedule-item user-schedule-item"
              key={plan.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectPlan(plan)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectPlan(plan);
                }
              }}
            >
              <div className="plan-time-block">
                <span className="plan-icon" aria-hidden="true">
                  <PlanIcon sceneType={plan.sceneType} />
                </span>
                <strong>{getScheduleTimeLabel(plan)}</strong>
                <small>
                  {getScheduleDurationLabel(plan) ? <ClockSoftIcon size={14} aria-hidden="true" /> : null}
                  {getScheduleDurationLabel(plan)}
                </small>
              </div>

              <span className="schedule-divider" aria-hidden="true" />

              <div className="schedule-item-main">
                <h3>{plan.title}</h3>
                {plan.note ? <p>{plan.note}</p> : null}
                {isReplyVisible ? <p className="invite-reply">{plan.inviteReply}</p> : null}
              </div>

              <button
                className={`invite-button is-${action.kind}`}
                type="button"
                disabled={isAccepted || plan.status === 'done' || plan.status === 'active'}
                onClick={(event) => {
                  event.stopPropagation();
                  handleInvite(plan);
                }}
              >
                {action.label}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function getScheduleTimeLabel(plan: UserPlan): string {
  if (plan.startTime) return plan.startTime;
  if (plan.timeLabel) return plan.timeLabel;
  return '时间待定';
}

function getScheduleDurationLabel(plan: UserPlan): string {
  switch (plan.id) {
    case 'focus-study':
      return '60 分钟';
    case 'walk':
      return '45 分钟';
    case 'movie':
      return '90 分钟';
    case 'workout':
      return '';
    default:
      return plan.sceneType === 'meal' ? '40 分钟' : '45 分钟';
  }
}

function PlanIcon({ sceneType }: { sceneType: SceneType }) {
  if (sceneType === 'fitness') return <DumbbellSoftIcon size={24} />;
  if (sceneType === 'study') return <PlanCardIcon size={24} />;
  if (sceneType === 'watch') return <CalendarSoftIcon size={24} />;
  return <SproutIcon size={24} />;
}

function getPlanAction(plan: UserPlan): { label: string; kind: 'invite' | 'accepted' | 'scheduled' | 'active' | 'done' } {
  if (plan.status === 'done') return { label: '已完成', kind: 'done' };
  if (plan.status === 'active') return { label: '进行中', kind: 'active' };
  if (plan.id === 'workout') return { label: '已安排', kind: 'scheduled' };
  if (plan.inviteStatus === 'accepted') return { label: '已约好', kind: 'accepted' };
  if (plan.status === 'accepted') return { label: '已安排', kind: 'scheduled' };
  return { label: '邀请澈', kind: 'invite' };
}
