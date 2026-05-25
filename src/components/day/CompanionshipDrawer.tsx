// CompanionshipDrawer 负责「今日相伴」的只读事件列表。
// 它展示有效陪伴事件，不展示 App 打开时长或数据面板。
import type { DayRecord, SceneCard } from '../../types/che';

interface CompanionshipDrawerProps {
  isOpen: boolean;
  activeCard: SceneCard | null;
  activeStartedAt: string | null;
  now: number;
  records: DayRecord[];
  onClose: () => void;
  onOpenActive: () => void;
  onOpenRecord: (record: DayRecord) => void;
}

export function CompanionshipDrawer({
  isOpen,
  activeCard,
  activeStartedAt,
  now,
  records,
  onClose,
  onOpenActive,
  onOpenRecord,
}: CompanionshipDrawerProps) {
  const completedRecords = records.filter((record) => record.kind === 'activity');

  return (
    <div className={`day-overview-layer${isOpen ? ' is-open' : ''}`} aria-hidden={!isOpen}>
      <button className="day-overview-scrim" type="button" aria-label="关闭今日相伴" onClick={onClose} />
      <section className="day-overview-drawer" role="dialog" aria-modal="true" aria-labelledby="companionship-title">
        <div className="drawer-handle" />
        <div className="drawer-header">
          <div>
            <h2 id="companionship-title">今日相伴</h2>
          </div>
          <button className="drawer-close" type="button" aria-label="关闭" onClick={onClose}>×</button>
        </div>

        <div className="day-overview-content">
          {activeCard ? (
            <section className="day-overview-group">
              <h3>进行中</h3>
              <button className="day-overview-row companionship-row" type="button" onClick={onOpenActive}>
                <span className="day-status-mark" aria-hidden="true">◐</span>
                <div>
                  <p>{activeCard.title}</p>
                  <small>{formatElapsed(activeStartedAt, now)}</small>
                </div>
              </button>
            </section>
          ) : null}

          <section className="day-overview-group">
            <h3>已完成</h3>
            <div className="day-overview-list">
              {completedRecords.length > 0 ? (
                completedRecords.map((record) => (
                  <button
                    className="day-overview-row companionship-row"
                    type="button"
                    key={record.id}
                    onClick={() => onOpenRecord(record)}
                  >
                    <span className="day-status-mark" aria-hidden="true">✓</span>
                    <div>
                      <p>{record.title}</p>
                      <small>{record.timeLabel} · {record.summary}</small>
                    </div>
                  </button>
                ))
              ) : (
                <article className="day-overview-row">
                  <span className="day-status-mark" aria-hidden="true">·</span>
                  <div>
                    <p>今天还没有完成的一起做事件</p>
                    <small>开始一个活动后，这里会慢慢收起来。</small>
                  </div>
                </article>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function formatElapsed(activeStartedAt: string | null, now: number): string {
  if (!activeStartedAt) {
    return '刚开始';
  }

  const elapsedMinutes = Math.max(0, Math.floor((now - new Date(activeStartedAt).getTime()) / 60_000));

  if (elapsedMinutes < 1) {
    return '刚开始';
  }

  return `已陪你 ${elapsedMinutes} 分钟`;
}
