import type { DayRecord } from '../../types/che';
import { toDateKey } from '../../utils/date';
import { CloseSoftIcon } from '../icons';

interface DeepChatSummaryDrawerProps {
  isOpen: boolean;
  records: DayRecord[];
  now: number;
  onClose: () => void;
}

interface DeepChatSummary {
  title: '今天聊到' | '上次聊到';
  summary: string;
  source: 'record' | 'empty';
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
            <CloseSoftIcon size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="day-overview-content deep-summary-content">
          <section className="deep-summary-section">
            <h3>{summary.title}</h3>
            <p>{summary.summary}</p>
          </section>
        </div>
      </section>
    </div>
  );
}

export function getDeepChatCardSummary(records: DayRecord[], now: number) {
  const summary = createDeepChatSummary(records, now);
  if (summary.source === 'record') {
    return {
      title: summary.title,
      detail: '看看那次聊了什么',
    };
  }
  return {
    title: '还没慢慢聊过',
    detail: '想说点什么时，可以来这里',
  };
}

function createDeepChatSummary(records: DayRecord[], now: number): DeepChatSummary {
  const deepRecords = records
    .filter((record) => record.sceneType === 'deep_room' && record.kind === 'letter')
    .sort((a, b) => getRecordTime(b) - getRecordTime(a));
  const todayKey = toDateKey(new Date(now));
  const latest = deepRecords[0];

  if (!latest) {
    return {
      title: '上次聊到',
      summary: '还没有留下记录。想说点什么时，可以从安静聊聊开始。',
      source: 'empty',
    };
  }

  return {
    title: latest.dateKey === todayKey ? '今天聊到' : '上次聊到',
    summary: latest.summary.trim() || '这次聊过的内容还没有留下摘要。',
    source: 'record',
  };
}

function getRecordTime(record: DayRecord) {
  return new Date(`${record.dateKey}T${record.startedAt ?? record.timeLabel ?? '00:00'}`).getTime() || 0;
}
