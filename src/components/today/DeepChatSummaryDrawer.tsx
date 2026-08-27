import type { DayRecord } from '../../types/che';
import { toDateKey } from '../../utils/date';

interface DeepChatSummaryDrawerProps {
  isOpen: boolean;
  records: DayRecord[];
  now: number;
  onClose: () => void;
}

interface DeepChatSummary {
  dateKey: string;
  count: number;
  timeLabels: string[];
  summary: string;
  cheFeedback: string;
  source: 'today' | 'last' | 'empty';
}

export function DeepChatSummaryDrawer({ isOpen, records, now, onClose }: DeepChatSummaryDrawerProps) {
  const summary = createDeepChatSummary(records, now);

  return (
    <div className={`day-overview-layer deep-summary-layer${isOpen ? ' is-open' : ''}`} aria-hidden={!isOpen}>
      <button className="day-overview-scrim" type="button" aria-label="关闭安静聊聊" onClick={onClose} />

      <section className="day-overview-drawer deep-summary-drawer" role="dialog" aria-modal="true" aria-labelledby="deep-summary-title">
        <div className="drawer-handle" aria-hidden="true" />

        <header className="drawer-header">
          <div>
            <h2 id="deep-summary-title">安静聊聊</h2>
          </div>
          <button className="drawer-close" type="button" aria-label="关闭" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="day-overview-content deep-summary-content">
          <section className="deep-summary-section">
            <h3>{summary.source === 'today' ? '今日深聊总结' : '上一次深聊总结'}</h3>
            <p>{summary.summary}</p>
            {summary.timeLabels.length > 0 ? <small>{summary.timeLabels.join(' · ')}</small> : null}
          </section>

          <section className="deep-summary-section deep-feedback">
            <h3>澈的总体反馈</h3>
            <p>{summary.cheFeedback}</p>
          </section>
        </div>
      </section>
    </div>
  );
}

export function getDeepChatCardSummary(records: DayRecord[], now: number) {
  const summary = createDeepChatSummary(records, now);
  if (summary.source === 'today') {
    return {
      title: `${summary.count} 段深聊`,
      detail: summary.timeLabels.length > 0 ? summary.timeLabels.join(' · ') : '今天',
    };
  }
  if (summary.source === 'last') {
    return {
      title: '上次聊过',
      detail: '看看澈留下的话',
    };
  }
  return {
    title: '还没慢慢聊过',
    detail: '可以从 Deep Room 开始',
  };
}

function createDeepChatSummary(records: DayRecord[], now: number): DeepChatSummary {
  const deepRecords = records
    .filter((record) => record.sceneType === 'deep_room' && record.kind === 'activity')
    .sort((a, b) => getRecordTime(b) - getRecordTime(a));
  const todayKey = toDateKey(new Date(now));
  const todayRecords = deepRecords.filter((record) => record.dateKey === todayKey);
  const sourceRecords = todayRecords.length > 0 ? todayRecords : deepRecords;

  if (sourceRecords.length === 0) {
    return {
      dateKey: todayKey,
      count: 0,
      timeLabels: [],
      summary: '这里还没有留下深聊记录。等你从 Deep Room 开始，重要的话会被轻轻收好。',
      cheFeedback: '我会在。你不用一次说完，能说到哪里，就先到哪里。',
      source: 'empty',
    };
  }

  const latest = sourceRecords[0];
  return {
    dateKey: latest.dateKey,
    count: sourceRecords.length,
    timeLabels: unique(sourceRecords.map((record) => record.timeLabel).filter(Boolean)),
    summary: latest.detail ?? latest.summary,
    cheFeedback: '我感觉你今天其实已经撑了很久。先别急着把所有事都整理好，能说出来一点，就已经很好了。',
    source: todayRecords.length > 0 ? 'today' : 'last',
  };
}

function getRecordTime(record: DayRecord) {
  return new Date(`${record.dateKey}T${record.startedAt ?? record.timeLabel ?? '00:00'}`).getTime() || 0;
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}
