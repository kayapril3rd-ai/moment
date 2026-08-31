import { useMemo, useState } from 'react';
import type { DayRecord, DayRecordOwner, UserPlan } from '../types/che';
import {
  buildDateStrip,
  buildMonthDays,
  formatMonthDay,
  formatYearMonth,
  isFutureDate,
  isPastDate,
  parseDateKey,
  toDateKey,
} from '../utils/date';
import { getUserPlanDateKey } from '../utils/plan';

export type ArrangeTab = 'mine' | 'che';

export function useArrangeDateState(
  dayRecords: DayRecord[],
  userPlans: UserPlan[] = [],
  initialTab: ArrangeTab = 'mine',
) {
  const todayKey = toDateKey(new Date());
  const [activeTab, setActiveTab] = useState<ArrangeTab>(initialTab);
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => parseDateKey(todayKey));

  const selectedDate = useMemo(() => {
    return parseDateKey(selectedDateKey);
  }, [selectedDateKey]);

  const dateStrip = useMemo(() => buildDateStrip(selectedDate), [selectedDate]);
  const monthDays = useMemo(() => buildMonthDays(calendarMonth), [calendarMonth]);
  const calendarMonthLabel = useMemo(() => formatYearMonth(calendarMonth), [calendarMonth]);
  const isPastRecord = isPastDate(selectedDateKey);
  const isFuture = isFutureDate(selectedDateKey);
  const contentDateKeys = useMemo(() => {
    const keys = new Set<string>();
    userPlans.forEach((plan) => {
      keys.add(getUserPlanDateKey(plan));
    });
    dayRecords.forEach((record) => {
      keys.add(record.dateKey);
    });
    return keys;
  }, [dayRecords, userPlans]);

  const selectedOwner: DayRecordOwner = activeTab === 'mine' ? 'mine' : 'che';
  const records = useMemo(
    () => dayRecords.filter((record) => record.dateKey === selectedDateKey && record.owner === selectedOwner),
    [dayRecords, selectedDateKey, selectedOwner],
  );
  const activityRecords = records.filter((record) => record.kind === 'activity');
  const letterRecords = records.filter((record) => record.kind === 'letter');

  const selectDate = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    setCalendarMonth(parseDateKey(dateKey));
    setIsCalendarExpanded(false);
  };

  return {
    activeTab,
    activityRecords,
    calendarMonth,
    calendarMonthLabel,
    contentDateKeys,
    dateStrip,
    isCalendarExpanded,
    isFuture,
    isPastRecord,
    isToday: selectedDateKey === todayKey,
    letterRecords,
    monthDays,
    selectDate,
    selectedDateKey,
    selectedMonthDay: formatMonthDay(selectedDateKey),
    setActiveTab,
    setCalendarMonth,
    setSelectedDateKey: selectDate,
    toggleCalendarExpanded: () => setIsCalendarExpanded((isExpanded) => !isExpanded),
  };
}
