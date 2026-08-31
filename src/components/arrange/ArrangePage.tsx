import { useMemo } from 'react';
import type { CheScheduleItem, DayRecord, UserPlan } from '../../types/che';
import { useArrangeDateState, type ArrangeTab } from '../../hooks/useArrangeDateState';
import { CheScheduleList } from '../schedule/CheScheduleList';
import { UserPlanList } from '../schedule/UserPlanList';
import { ArrangeDateStrip } from './ArrangeDateStrip';
import { ArrangeRecordView } from './ArrangeRecordView';
import { ArrangeSegmentedTabs } from './ArrangeSegmentedTabs';
import { getUserPlanDateKey } from '../../utils/plan';

interface ArrangePageProps {
  userPlans: UserPlan[];
  getCheScheduleForDate: (dateKey: string) => CheScheduleItem[];
  dayRecords: DayRecord[];
  onAddPlan: (input: string, selectedDateKey?: string) => boolean;
  onInvitePlan: (planId: string) => void;
  onSelectPlan: (plan: UserPlan) => void;
  initialTab?: ArrangeTab;
}

export function ArrangePage({
  userPlans,
  getCheScheduleForDate,
  dayRecords,
  onAddPlan,
  onInvitePlan,
  onSelectPlan,
  initialTab = 'mine',
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
  } = useArrangeDateState(dayRecords, userPlans, initialTab);

  const visibleUserPlans = userPlans.filter((plan) => getUserPlanDateKey(plan) === selectedDateKey);
  const visibleCheSchedule = useMemo(
    () => getCheScheduleForDate(selectedDateKey),
    [getCheScheduleForDate, selectedDateKey],
  );

  return (
    <section className="tab-page arrange-page schedule-page arrange-compact-page" aria-label="安排">
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
          cheSchedule={visibleCheSchedule}
          selectedMonthDay={selectedMonthDay}
          onTabChange={setActiveTab}
        />
      ) : (
        <>
          <ArrangeSegmentedTabs activeTab={activeTab} onTabChange={setActiveTab} />
          {activeTab === 'mine' ? (
            <UserPlanList plans={visibleUserPlans} selectedDateKey={selectedDateKey} onAddPlan={onAddPlan} onInvite={onInvitePlan} onSelectPlan={onSelectPlan} />
          ) : (
            <section className="che-arrange-panel" aria-label="澈的安排">
              {visibleCheSchedule.length > 0 ? <CheScheduleList schedule={visibleCheSchedule} /> : <p className="arrange-empty-text">这一天还没有安排。</p>}
            </section>
          )}
        </>
      )}
    </section>
  );
}
