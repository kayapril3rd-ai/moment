import { FormEvent, useEffect, useRef, useState } from 'react';
import type { SceneType, UserPlan } from '../../types/che';
import { ChatSoftIcon, ClockSoftIcon, DumbbellSoftIcon, MovieIcon, PlanCardIcon, SproutIcon, TodayBubbleIcon } from '../icons';

interface UserPlanListProps {
  plans: UserPlan[];
  selectedDateKey?: string;
  onAddPlan: (input: string, selectedDateKey?: string) => boolean;
  onInvite: (planId: string) => void;
  onSelectPlan: (plan: UserPlan) => void;
}

const replyVisibleMs = 2200;

export function UserPlanList({ plans, selectedDateKey, onAddPlan, onInvite, onSelectPlan }: UserPlanListProps) {
  const [planInput, setPlanInput] = useState('');
  const [hint, setHint] = useState('');
  const [visibleReplyIds, setVisibleReplyIds] = useState<Set<string>>(() => new Set());
  const replyTimers = useRef<number[]>([]);

  useEffect(() => () => replyTimers.current.forEach((timerId) => window.clearTimeout(timerId)), []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const didAdd = onAddPlan(planInput, selectedDateKey);
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

      <div className="schedule-list my-schedule-list" aria-label="我的计划">
        {plans.length === 0 ? (
          <article className="arrange-empty-card">
            <p>这一天还没有安排。</p>
          </article>
        ) : plans.map((plan) => {
          const isAccepted = plan.inviteStatus === 'accepted';
          const isReplyVisible = visibleReplyIds.has(plan.id) && Boolean(plan.inviteReply);
          const action = getPlanAction(plan);
          const durationLabel = getScheduleDurationLabel(plan);

          return (
            <article
              className="schedule-item user-schedule-item my-plan-card"
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
              <span className="plan-icon my-plan-icon" aria-hidden="true">
                <PlanIcon sceneType={plan.sceneType} />
              </span>
              <div className="schedule-item-main my-plan-main">
                <div className="my-plan-meta">
                  <time>{getScheduleTimeLabel(plan)}</time>
                  {durationLabel ? (
                    <small className="my-plan-duration">
                      <ClockSoftIcon size={13} aria-hidden="true" />
                      {durationLabel}
                    </small>
                  ) : null}
                </div>
                <h3 className="my-plan-title">{plan.title}</h3>
                {plan.note ? <p className="my-plan-desc">{plan.note}</p> : null}
                {isReplyVisible ? <p className="invite-reply my-plan-desc">{plan.inviteReply}</p> : null}
              </div>

              <button
                className={`invite-button my-plan-action is-${action.kind}`}
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
  if (plan.durationMinutes) return `${plan.durationMinutes} 分钟`;
  return '';
}

function PlanIcon({ sceneType }: { sceneType: SceneType }) {
  if (sceneType === 'fitness') return <DumbbellSoftIcon size={24} />;
  if (sceneType === 'study') return <PlanCardIcon size={24} />;
  if (sceneType === 'watch') return <MovieIcon size={24} />;
  if (sceneType === 'meal') return <TodayBubbleIcon size={24} />;
  if (sceneType === 'gaming') return <ChatSoftIcon size={24} />;
  return <SproutIcon size={24} />;
}

function getPlanAction(plan: UserPlan): { label: string; kind: 'invite' | 'accepted' | 'active' | 'done' } {
  if (plan.status === 'done') return { label: '已完成', kind: 'done' };
  if (plan.status === 'active') return { label: '进行中', kind: 'active' };
  if (plan.inviteStatus === 'accepted') return { label: '已约好', kind: 'accepted' };
  return { label: '邀请澈', kind: 'invite' };
}
