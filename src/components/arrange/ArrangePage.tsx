// ArrangePage owns the Arrange tab: today's plans, Che's day, and past-day records.
// Keep Today and Scene Chat behavior outside this file.
import { useState } from 'react';
import type { CheScheduleItem, DayRecord, UserPlan } from '../../types/che';
import { AppLogoIcon, BellSoftIcon } from '../icons/SoftIcons';
import { CheScheduleList } from '../schedule/CheScheduleList';
import { UserPlanList } from '../schedule/UserPlanList';

interface ArrangePageProps {
  userPlans: UserPlan[];
  cheSchedule: CheScheduleItem[];
  dayRecords: DayRecord[];
  onAddPlan: (input: string) => boolean;
  onInvitePlan: (planId: string) => void;
  onSelectPlan: (plan: UserPlan) => void;
}

type ArrangeTab = 'mine' | 'che';

const dates = [22, 23, 24, 25, 26];
const today = 23;

const mineRecords = [
  { time: '10:00', title: '图书馆学习', summary: '一起专注了 2 小时', status: '已完成' },
  { time: '16:30', title: '公园拍照', summary: '记录了很多美好瞬间', status: '已完成' },
  { time: '19:30', title: '一起做晚餐', summary: '你做饭，我打下手', status: '已完成' },
];

const cheRecords = [
  { time: '上午', title: '整理评审稿', summary: '今天把工作收得更顺一点', status: '已完成' },
  { time: '傍晚', title: '海边散步', summary: '风有点大，但心情不错', status: '已完成' },
  { time: '夜里', title: '和你安静聊聊', summary: '那段话被好好收好了', status: '已完成' },
];

export function ArrangePage({
  userPlans,
  cheSchedule,
  onAddPlan,
  onInvitePlan,
  onSelectPlan,
}: ArrangePageProps) {
  const [activeTab, setActiveTab] = useState<ArrangeTab>('mine');
  const [selectedDate, setSelectedDate] = useState(today);
  const isPastRecord = selectedDate < today;
  const isFuture = selectedDate > today;

  return (
    <section className="tab-page arrange-page schedule-page" aria-labelledby="arrange-title">
      <header className="schedule-header">
        <span className="schedule-brand">
          <AppLogoIcon size={38} aria-hidden="true" />
          <h1 id="arrange-title">澈</h1>
        </span>
        <button className="schedule-bell" type="button" aria-label="轻提醒">
          <BellSoftIcon size={24} aria-hidden="true" />
        </button>
      </header>

      <DateCircles selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      {isPastRecord ? (
        <RecordView selectedDate={selectedDate} activeTab={activeTab} onTabChange={setActiveTab} />
      ) : (
        <>
          <SegmentedTabs activeTab={activeTab} onTabChange={setActiveTab} />
          {isFuture ? (
            <section className="arrange-empty-day" aria-label="未来日期">
              <h2 className="schedule-section-title">今日安排</h2>
              <p>这一天还没有安排。先把今天过稳一点。</p>
            </section>
          ) : activeTab === 'mine' ? (
            <UserPlanList plans={userPlans} onAddPlan={onAddPlan} onInvite={onInvitePlan} onSelectPlan={onSelectPlan} />
          ) : (
            <section className="che-arrange-panel" aria-labelledby="che-arrange-title">
              <h2 id="che-arrange-title" className="schedule-section-title">今日安排</h2>
              <CheScheduleList schedule={cheSchedule} />
            </section>
          )}
        </>
      )}
    </section>
  );
}

function DateCircles({ selectedDate, onSelectDate }: { selectedDate: number; onSelectDate: (date: number) => void }) {
  return (
    <div className="date-strip date-strip-circles" aria-label="日期选择">
      {dates.map((day) => (
        <button
          className={`date-pill${selectedDate === day ? ' is-active' : ''}`}
          type="button"
          key={day}
          onClick={() => onSelectDate(day)}
          aria-label={`5月${day}日`}
        >
          <span>{day}</span>
        </button>
      ))}
    </div>
  );
}

function SegmentedTabs({ activeTab, onTabChange }: { activeTab: ArrangeTab; onTabChange: (tab: ArrangeTab) => void }) {
  return (
    <div className="schedule-segmented arrange-segmented" role="tablist" aria-label="安排视图">
      <button className={activeTab === 'mine' ? 'is-active' : ''} type="button" onClick={() => onTabChange('mine')}>
        我的
      </button>
      <button className={activeTab === 'che' ? 'is-active' : ''} type="button" onClick={() => onTabChange('che')}>
        澈的
      </button>
    </div>
  );
}

function RecordView({
  selectedDate,
  activeTab,
  onTabChange,
}: {
  selectedDate: number;
  activeTab: ArrangeTab;
  onTabChange: (tab: ArrangeTab) => void;
}) {
  const records = activeTab === 'mine' ? mineRecords : cheRecords;
  const letter =
    activeTab === 'mine'
      ? {
          title: '晚安信 · 22:47',
          lines: ['今天过得很充实呀，', '谢谢你陪我度过这么美好的一天。', '—— 澈'],
        }
      : {
          title: '给你的小纸条',
          lines: ['今天看到一句话，想起你说的那段话。', '谢谢你一直在这里。'],
        };

  return (
    <section className="day-record-view" aria-labelledby="day-record-title">
      <h2 id="day-record-title">{`5月${selectedDate}日的记录`}</h2>
      <SegmentedTabs activeTab={activeTab} onTabChange={onTabChange} />

      <div className="record-block">
        <h3>活动记录</h3>
        <div className="record-timeline">
          {records.map((record) => (
            <article className="record-timeline-row" key={`${record.time}-${record.title}`}>
              <time>{record.time}</time>
              <div>
                <strong>{record.title}</strong>
                <p>{record.summary}</p>
              </div>
              <span>{record.status}</span>
            </article>
          ))}
        </div>
      </div>

      <div className="record-block">
        <h3>聊天信件</h3>
        <article className="record-letter-card">
          <strong>{letter.title}</strong>
          {letter.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </article>
      </div>
    </section>
  );
}
