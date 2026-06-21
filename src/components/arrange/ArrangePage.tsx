import type { CheScheduleItem, DayRecord, UserPlan } from '../../types/che';
import { useArrangeDateState } from '../../hooks/useArrangeDateState';
import { CalendarSoftIcon } from '../icons';
import { CheScheduleList } from '../schedule/CheScheduleList';
import { UserPlanList } from '../schedule/UserPlanList';
import { ArrangeDateStrip } from './ArrangeDateStrip';
import { ArrangeRecordView } from './ArrangeRecordView';
import { ArrangeSegmentedTabs } from './ArrangeSegmentedTabs';

interface ArrangePageProps {
  userPlans: UserPlan[];
  cheSchedule: CheScheduleItem[];
  dayRecords: DayRecord[];
  onAddPlan: (input: string, selectedDateKey?: string) => boolean;
  onInvitePlan: (planId: string) => void;
  onSelectPlan: (plan: UserPlan) => void;
}

export function ArrangePage({
  userPlans,
  cheSchedule,
  dayRecords,
  onAddPlan,
  onInvitePlan,
  onSelectPlan,
}: ArrangePageProps) {
  const {
    activeTab,
    activityRecords,
    calendarMonthLabel,
    contentDateKeys,
    dateStrip,
    isCalendarExpanded,
    isPastRecord,
    letterRecords,
    monthDays,
    selectedDateKey,
    selectedMonthDay,
    selectDate,
    setActiveTab,
    toggleCalendarExpanded,
  } = useArrangeDateState(dayRecords, userPlans, cheSchedule);

  const visibleUserPlans = userPlans.filter((plan) => (plan.dateKey ?? selectedDateKey) === selectedDateKey);
  const visibleCheSchedule = cheSchedule.filter((item) => (item.dateKey ?? selectedDateKey) === selectedDateKey);

  return (
    <section className="tab-page arrange-page schedule-page arrange-compact-page" aria-labelledby="arrange-title">
      <header className="schedule-header">
        <span className="schedule-brand">
          <CalendarSoftIcon className="schedule-title-icon" size={38} aria-hidden="true" />
          <h1 id="arrange-title">安排</h1>
        </span>
      </header>

      <ArrangeDateStrip
        calendarMonthLabel={calendarMonthLabel}
        contentDateKeys={contentDateKeys}
        dateStrip={dateStrip}
        isCalendarExpanded={isCalendarExpanded}
        monthDays={monthDays}
        selectedDateKey={selectedDateKey}
        onSelectDate={selectDate}
        onToggleCalendar={toggleCalendarExpanded}
      />

      {isPastRecord ? (
        <ArrangeRecordView
          activeTab={activeTab}
          activityRecords={activityRecords}
          letterRecords={letterRecords}
          selectedMonthDay={selectedMonthDay}
          onTabChange={setActiveTab}
        />
      ) : (
        <>
          <ArrangeSegmentedTabs activeTab={activeTab} onTabChange={setActiveTab} />
          {activeTab === 'mine' ? (
            <UserPlanList plans={visibleUserPlans} selectedDateKey={selectedDateKey} onAddPlan={onAddPlan} onInvite={onInvitePlan} onSelectPlan={onSelectPlan} />
          ) : (
            <section className="che-arrange-panel" aria-labelledby="che-arrange-title">
              <h2 id="che-arrange-title" className="schedule-section-title">今日安排</h2>
              {visibleCheSchedule.length > 0 ? <CheScheduleList schedule={visibleCheSchedule} /> : <p className="arrange-empty-text">这一天还没有安排。</p>}
            </section>
          )}
        </>
      )}
    </section>
  );
}
