import { useState } from 'react';
import type { ArrangeTab } from '../../hooks/useArrangeDateState';
import type { CheScheduleItem, DayRecord } from '../../types/che';
import { sceneRegistry } from '../../data';
import { ArrowRightSoftIcon, CloseSoftIcon, SproutIcon } from '../icons';
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
  return (
    <section className="day-record-view" aria-labelledby="day-record-title">
      <h2 className="sr-only" id="day-record-title">{selectedMonthDay}的记录</h2>
      <ArrangeSegmentedTabs activeTab={activeTab} onTabChange={onTabChange} />

      <div className="record-block">
        <h3>活动记录</h3>
        {activeTab === 'che' ? (
          cheSchedule.length > 0 ? (
            <div className="che-history-timeline">
              {cheSchedule.map((item) => (
                <article className="che-history-item" key={item.id}>
                  <div className="che-history-rail" aria-hidden="true">
                    <span className="che-history-dot" />
                  </div>
                  <div className="che-history-content">
                    <time className="che-history-time">{item.timeLabel ?? item.startTime}</time>
                    <strong className="che-history-title">{item.title}</strong>
                    <p className="che-history-detail">{item.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="record-empty">这一天还没有活动记录。</p>
          )
        ) : (
          <div className="record-timeline">
            {activityRecords.length > 0 ? (
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
        )}
      </div>

      <ChatLetterSection letterRecords={letterRecords} />
    </section>
  );
}

export function ChatLetterSection({ letterRecords }: { letterRecords: DayRecord[] }) {
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const selectedLetter = letterRecords.find((letter) => letter.id === selectedLetterId) ?? null;

  return (
    <>
      <div className="record-block chat-letter-section">
        <h3>聊天信件</h3>
        {letterRecords.length > 0 ? (
          letterRecords.map((letter) => (
            <button className="letter-card" key={letter.id} type="button" onClick={() => setSelectedLetterId(letter.id)}>
              <div className="letter-copy">
                <strong>{letter.title}</strong>
                <p>{letter.summary}</p>
                <span className="letter-meta">{getLetterSceneLabel(letter)} · {letter.timeLabel}</span>
              </div>
              <ArrowRightSoftIcon className="letter-arrow" size={18} aria-hidden="true" />
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
        <div className="letter-detail-overlay" role="presentation" onClick={() => setSelectedLetterId(null)}>
          <section
            className="letter-detail-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="letter-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="letter-detail-header">
              <div>
                <h2 id="letter-detail-title">{selectedLetter.title}</h2>
                <span>{getLetterSceneLabel(selectedLetter)} · {getLetterTimeRange(selectedLetter)}</span>
              </div>
              <button type="button" aria-label="关闭聊天记录" onClick={() => setSelectedLetterId(null)}>
                <CloseSoftIcon size={18} aria-hidden="true" />
              </button>
            </header>
            <div className="letter-detail-content">
              <h3>聊天记录</h3>
              <p>{selectedLetter.detail}</p>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function getLetterSceneLabel(letter: DayRecord): string {
  return letter.sceneType ? sceneRegistry[letter.sceneType].shortTitle : '聊天';
}

function getLetterTimeRange(letter: DayRecord): string {
  if (letter.startedAt && letter.endedAt) return `${letter.startedAt}–${letter.endedAt}`;
  return letter.timeLabel;
}
