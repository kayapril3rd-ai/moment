// PlanDetailSheet 负责「安排 / 我的」里单条计划的详情和轻编辑。
// 我的今天只读；所有修改状态、恢复待做、删除和邀约都从这里进入。
import { FormEvent, useState } from 'react';
import type { UserPlan } from '../../types/che';
import { getPlanTimeAnchor } from '../../utils/plan';

interface PlanDetailSheetProps {
  plan: UserPlan;
  onClose: () => void;
  onUpdate: (planId: string, updates: Partial<Pick<UserPlan, 'title' | 'startTime' | 'timeLabel' | 'timePrecision'>>) => void;
  onInvite: (planId: string) => void;
  onCancelInvite: (planId: string) => void;
  onComplete: (planId: string) => void;
  onRestoreTodo: (planId: string) => void;
  onDelete: (planId: string) => void;
}

export function PlanDetailSheet({
  plan,
  onClose,
  onUpdate,
  onInvite,
  onCancelInvite,
  onComplete,
  onRestoreTodo,
  onDelete,
}: PlanDetailSheetProps) {
  const [title, setTitle] = useState(plan.title);
  const [timeLabel, setTimeLabel] = useState(plan.timeLabel ?? plan.startTime);
  const isAccepted = plan.inviteStatus === 'accepted';
  const isCompleted = plan.status === 'done';
  const statusLabel = getStatusLabel(plan);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextTitle = title.trim();
    const nextTime = timeLabel.trim();

    if (!nextTitle || !nextTime) {
      return;
    }

    onUpdate(plan.id, {
      title: nextTitle,
      startTime: extractStartTime(nextTime),
      timeLabel: nextTime,
      timePrecision: inferTimePrecision(nextTime),
    });
    onClose();
  };

  return (
    <div className="activity-layer" role="presentation">
      <button className="activity-scrim" type="button" aria-label="关闭计划详情" onClick={onClose} />
      <section className="activity-sheet plan-detail-sheet" role="dialog" aria-modal="true" aria-labelledby="plan-detail-title">
        <p className="activity-eyebrow">{getPlanTimeAnchor(plan)} · {statusLabel}</p>
        <h2 id="plan-detail-title">计划详情</h2>

        <form className="activity-time-form" onSubmit={handleSubmit}>
          <label htmlFor="plan-title-input">标题</label>
          <input
            id="plan-title-input"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <label htmlFor="plan-time-input">时间</label>
          <input
            id="plan-time-input"
            type="text"
            placeholder="比如 20:30 / 稍后 / 睡前"
            value={timeLabel}
            onChange={(event) => setTimeLabel(event.target.value)}
          />

          <p>{isAccepted ? '澈已经答应这段安排。' : '还没有邀请澈一起做。'}</p>

          <div className="activity-actions activity-actions-compact">
            <button className="activity-action-primary" type="submit">保存修改</button>
            {isAccepted ? (
              <button className="activity-action-secondary" type="button" onClick={() => onCancelInvite(plan.id)}>
                取消邀约
              </button>
            ) : (
              <button className="activity-action-secondary" type="button" onClick={() => onInvite(plan.id)}>
                邀请澈
              </button>
            )}
            {isCompleted ? (
              <button className="activity-action-secondary" type="button" onClick={() => onRestoreTodo(plan.id)}>
                恢复待做
              </button>
            ) : (
              <button className="activity-action-secondary" type="button" onClick={() => onComplete(plan.id)}>
                标记完成
              </button>
            )}
            <button className="activity-action-ghost" type="button" onClick={() => onDelete(plan.id)}>
              删除计划
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function getStatusLabel(plan: UserPlan): string {
  if (plan.status === 'done') {
    return '已完成';
  }

  if (plan.status === 'active') {
    return '进行中';
  }

  if (plan.status === 'cancelled') {
    return '已取消';
  }

  if (plan.inviteStatus === 'accepted') {
    return '已约好';
  }

  return '待做';
}

function extractStartTime(timeLabel: string): string {
  return timeLabel.match(/\d{1,2}:\d{2}/)?.[0] ?? timeLabel;
}

function inferTimePrecision(timeLabel: string) {
  if (/^\d{1,2}:\d{2}$/.test(timeLabel)) {
    return 'exact' as const;
  }

  if (/左右|大概/.test(timeLabel)) {
    return 'approximate' as const;
  }

  if (/现在|稍后/.test(timeLabel)) {
    return 'open' as const;
  }

  return 'period' as const;
}
