// TwoPersonOverview 负责展示用户和澈今天的摘要。
// 摘要由 TodayPage 的当前 runtime state 提供，点击行为也由 TodayPage 传入。
import type { CheScheduleItem, TodayCopy } from '../../types/che';

interface DaySummary {
  title: string;
  detail: string;
}

interface TwoPersonOverviewProps {
  copy: TodayCopy;
  userSummary: DaySummary;
  cheSummary: DaySummary;
  nextSharedSchedule?: CheScheduleItem;
  onOpenUserSchedule: () => void;
  onOpenCheSchedule: () => void;
  onOpenSharedDetail: () => void;
}

export function TwoPersonOverview({
  copy,
  userSummary,
  cheSummary,
  nextSharedSchedule,
  onOpenUserSchedule,
  onOpenCheSchedule,
  onOpenSharedDetail,
}: TwoPersonOverviewProps) {
  return (
    <section className="overview-section" aria-labelledby="overview-title">
      <div className="section-heading">
        <h2 id="overview-title">{copy.overviewTitle}</h2>
      </div>

      <div className="overview-grid">
        <button className="overview-card" type="button" onClick={onOpenUserSchedule}>
          <p className="card-label">{copy.userOverviewTitle}</p>
          <h3>{userSummary.title}</h3>
          <p className="overview-detail">{userSummary.detail}</p>
        </button>

        <button className="overview-card overview-card-muted" type="button" onClick={onOpenCheSchedule}>
          <p className="card-label">{copy.cheOverviewTitle}</p>
          <h3>{cheSummary.title}</h3>
          <p className="overview-detail">{cheSummary.detail}</p>
        </button>
      </div>

      {nextSharedSchedule ? (
        <button className="shared-note" type="button" onClick={onOpenSharedDetail}>
          {copy.sharedOverlapLabel}：{nextSharedSchedule.timeLabel ?? nextSharedSchedule.startTime} · 一起练背
        </button>
      ) : null}
    </section>
  );
}
