import type { ArrangeTab } from '../../hooks/useArrangeDateState';
import type { DayRecord } from '../../types/che';
import { ArrangeSegmentedTabs } from './ArrangeSegmentedTabs';

interface ArrangeRecordViewProps {
  activeTab: ArrangeTab;
  activityRecords: DayRecord[];
  letterRecords: DayRecord[];
  selectedMonthDay: string;
  onTabChange: (tab: ArrangeTab) => void;
}

export function ArrangeRecordView({
  activeTab,
  activityRecords,
  letterRecords,
  selectedMonthDay,
  onTabChange,
}: ArrangeRecordViewProps) {
  const emptyText = activeTab === 'mine' ? '这一天还没有你的活动记录。' : '这一天还没有澈的活动记录。';

  return (
    <section className="day-record-view" aria-labelledby="day-record-title">
      <h2 id="day-record-title">{selectedMonthDay}的记录</h2>
      <ArrangeSegmentedTabs activeTab={activeTab} onTabChange={onTabChange} />

      <div className="record-block">
        <h3>活动记录</h3>
        <div className="record-timeline">
          {activityRecords.length > 0 ? (
            activityRecords.map((record) => (
              <article className="record-timeline-row" key={record.id}>
                <time>{record.timeLabel}</time>
                <div>
                  <strong>{record.title}</strong>
                  <p>{record.summary}</p>
                </div>
                <span>{record.status === 'completed' ? '已完成' : '进行中'}</span>
              </article>
            ))
          ) : (
            <p className="record-empty">{emptyText}</p>
          )}
        </div>
      </div>

      <div className="record-block">
        <h3>聊天信件</h3>
        {letterRecords.length > 0 ? (
          letterRecords.map((letter) => (
            <article className="record-letter-card" key={letter.id}>
              <strong>{letter.title} · {letter.timeLabel}</strong>
              <p>{letter.summary}</p>
              {letter.detail ? <p>{letter.detail}</p> : null}
            </article>
          ))
        ) : (
          <article className="record-letter-card">
            <p>这一天没有收起新的信件。</p>
          </article>
        )}
      </div>
    </section>
  );
}
