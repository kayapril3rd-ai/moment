// RecentMoments shows one lightweight shared memory on Today.
// Edit the actual copy in src/data/mockMoments.ts.
import type { RecentMoment } from '../../types/che';
import { formatMomentTime } from '../../utils/date';
import { ArrowRightSoftIcon } from '../icons';

interface RecentMomentsProps {
  title: string;
  archiveLabel: string;
  moments: RecentMoment[];
  now: number;
  onOpenArchive: () => void;
  onOpenCheSchedule: () => void;
}

export function RecentMoments({ title, archiveLabel, moments, now, onOpenArchive, onOpenCheSchedule }: RecentMomentsProps) {
  return (
    <section className="moments-section" aria-labelledby="moments-title">
      <div className="section-heading section-heading-inline">
        <h2 id="moments-title">{title}</h2>
        <button className="text-link-button" type="button" onClick={onOpenArchive}>
          <span>{archiveLabel}</span>
          <ArrowRightSoftIcon size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="moment-list">
        {moments.slice(0, 1).map((moment) => (
          <button className="moment-card" key={moment.id} type="button" onClick={onOpenCheSchedule}>
            <time dateTime={moment.createdAt}>{formatMomentTime(moment.createdAt, now)}</time>
            <p>{moment.text}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
