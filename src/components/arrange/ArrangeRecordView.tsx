import { useState } from 'react';
import type { ArrangeTab } from '../../hooks/useArrangeDateState';
import type { CheScheduleItem, DayRecord } from '../../types/che';
import { CloseSoftIcon, SproutIcon } from '../icons';
import { ArrangeSegmentedTabs } from './ArrangeSegmentedTabs';

interface ArrangeRecordViewProps {
  activeTab: ArrangeTab;
  activityRecords: DayRecord[];
  letterRecords: DayRecord[];
  cheSchedule: CheScheduleItem[];
  selectedMonthDay: string;
  onTabChange: (tab: ArrangeTab) => void;
}

export function ArrangeRecordView({
  activeTab,
  activityRecords,
  letterRecords,
  cheSchedule,
  selectedMonthDay,
  onTabChange,
}: ArrangeRecordViewProps) {
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const selectedLetter = letterRecords.find((letter) => letter.id === selectedLetterId) ?? null;

  return (
    <section className="day-record-view" aria-labelledby="day-record-title">
      <h2 className="sr-only" id="day-record-title">{selectedMonthDay}的记录</h2>
      <ArrangeSegmentedTabs activeTab={activeTab} onTabChange={onTabChange} />

      <div className="record-block">
        <h3>活动记录</h3>
        <div className="record-timeline">
          {activeTab === 'che' && cheSchedule.length > 0 ? (
            cheSchedule.map((item) => (
              <article className="record-item" key={item.id}>
                <time className="record-time">{item.timeLabel ?? item.startTime}</time>
                <span className="record-dot" aria-hidden="true" />
                <div className="record-main">
                  <strong className="record-title">{item.title}</strong>
                  <p className="record-desc">{item.detail}</p>
                </div>
              </article>
            ))
          ) : activityRecords.length > 0 ? (
            activityRecords.map((record) => (
              <article className="record-item" key={record.id}>
                <time className="record-time">{record.timeLabel}</time>
                <span className="record-dot" aria-hidden="true" />
                <div className="record-main">
                  <strong className="record-title">{record.title}</strong>
                  <p className="record-desc">{record.summary}</p>
                </div>
                <span className="record-status">{record.status === 'completed' ? '已完成' : '进行中'}</span>
              </article>
            ))
          ) : (
            <p className="record-empty">这一天还没有活动记录。</p>
          )}
        </div>
      </div>

      <div className="record-block">
        <h3>聊天信件</h3>
        {letterRecords.length > 0 ? (
          letterRecords.map((letter) => (
            <button className="letter-card" key={letter.id} type="button" onClick={() => setSelectedLetterId(letter.id)}>
              <div className="letter-copy">
                <strong>{letter.title} · {letter.timeLabel}</strong>
                <p>{letter.summary}</p>
              </div>
              <SproutIcon className="letter-illustration" size={128} aria-hidden="true" />
            </button>
          ))
        ) : (
          <article className="letter-card is-empty">
            <p>这一天还没有留下信件。</p>
            <SproutIcon className="letter-illustration" size={128} aria-hidden="true" />
          </article>
        )}
      </div>

      {selectedLetter ? (
        <section className="letter-transcript" aria-label={`${selectedLetter.title}聊天记录`}>
          <header>
            <div>
              <strong>{selectedLetter.title}</strong>
              <span>{selectedLetter.timeLabel}</span>
            </div>
            <button type="button" aria-label="关闭聊天记录" onClick={() => setSelectedLetterId(null)}>
              <CloseSoftIcon size={18} aria-hidden="true" />
            </button>
          </header>
          <p>{selectedLetter.detail}</p>
        </section>
      ) : null}
    </section>
  );
}
