// ActivityDetail 负责展示 scheduled / active / completed / cancelled 活动详情。
// 状态变更由 TodayPage 统一处理，确保 Hero、场景卡、日程和时光记录保持一致。
import type { SceneCard } from '../../types/che';

interface ActivityDetailProps {
  card: SceneCard;
  onClose: () => void;
  onStart: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onBackToScene: () => void;
  onComplete: () => void;
  onOpenMoments: () => void;
}

export function ActivityDetail({
  card,
  onClose,
  onStart,
  onEdit,
  onCancel,
  onBackToScene,
  onComplete,
  onOpenMoments,
}: ActivityDetailProps) {
  const timeLabel = card.timeLabel ?? card.timeHint;
  const statusLabel = getStatusLabel(card);

  return (
    <div className="activity-layer" role="presentation">
      <button className="activity-scrim" type="button" aria-label="关闭活动详情" onClick={onClose} />
      <section className="activity-sheet" role="dialog" aria-modal="true" aria-labelledby="activity-detail-title">
        <p className="activity-eyebrow">{timeLabel} · {statusLabel}</p>
        <h2 id="activity-detail-title">{card.title}</h2>
        <p>{getActivityDescription(card)}</p>

        <dl className="activity-meta">
          <div>
            <dt>时间</dt>
            <dd>今天 {timeLabel}</dd>
          </div>
          <div>
            <dt>地点</dt>
            <dd>{getLocation(card)}</dd>
          </div>
          <div>
            <dt>澈的状态</dt>
            <dd>{getCheState(card)}</dd>
          </div>
        </dl>

        <div className="activity-actions activity-actions-compact">
          {card.status === 'active' ? (
            <>
              <button className="activity-action-primary" type="button" onClick={onBackToScene}>回到场景</button>
              <button className="activity-action-secondary" type="button" onClick={onComplete}>标记完成</button>
              <button className="activity-action-secondary" type="button" onClick={onEdit}>修改安排</button>
            </>
          ) : null}

          {card.status === 'completed' ? (
            <>
              <button className="activity-action-primary" type="button" onClick={onOpenMoments}>查看时光记录</button>
              <button className="activity-action-ghost" type="button" onClick={onClose}>关闭</button>
            </>
          ) : null}

          {card.status === 'disabled' ? (
            <>
              <button className="activity-action-secondary" type="button" disabled>已取消</button>
              <button className="activity-action-ghost" type="button" onClick={onClose}>关闭</button>
            </>
          ) : null}

          {card.status !== 'active' && card.status !== 'completed' && card.status !== 'disabled' ? (
            <>
              <button className="activity-action-primary" type="button" onClick={onStart}>提前开始</button>
              <button className="activity-action-secondary" type="button" onClick={onEdit}>修改安排</button>
              <button className="activity-action-ghost" type="button" onClick={onCancel}>取消活动</button>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function getStatusLabel(card: SceneCard): string {
  switch (card.status) {
    case 'active':
      return '进行中';
    case 'completed':
      return '已完成';
    case 'disabled':
      return '已取消';
    default:
      return '已约好';
  }
}

function getActivityDescription(card: SceneCard): string {
  if (card.status === 'active') {
    return '你们已经开始了。可以回到场景里继续，也可以在结束后标记完成。';
  }

  if (card.status === 'completed') {
    return '这件事已经放进今天的时光记录里了。';
  }

  return '你们约好了晚点一起开始。他会陪你进入状态，不用一下子做得太满。';
}

function getLocation(card: SceneCard): string {
  switch (card.sceneType) {
    case 'fitness':
      return '健身房 / 还没定';
    case 'meal':
      return '餐桌旁';
    case 'watch':
      return '客厅';
    case 'study':
      return '书桌边';
    default:
      return '还没定';
  }
}

function getCheState(card: SceneCard): string {
  if (card.status === 'active') {
    return '他已经在这段时间里了，会陪你慢慢开始。';
  }

  if (card.status === 'completed') {
    return '他记得这段小安排，已经收进今天的片段里。';
  }

  return '他前面还在处理一点事，但这段已经给你留着。';
}
