import { useMemo, useState } from 'react';
import type { CheScheduleItem, DayRecord, DayRecordOwner, UserPlan } from '../types/che';
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

export type ArrangeTab = 'mine' | 'che';

export function useArrangeDateState(dayRecords: DayRecord[], userPlans: UserPlan[] = [], cheSchedule: CheScheduleItem[] = []) {
  const todayKey = toDateKey(new Date());
  const [activeTab, setActiveTab] = useState<ArrangeTab>('mine');
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
      if (plan.dateKey) keys.add(plan.dateKey);
    });
    cheSchedule.forEach((item) => {
      if (item.dateKey) keys.add(item.dateKey);
    });
    dayRecords.forEach((record) => {
      const key = record.dateKey ?? record.date;
      if (key) keys.add(key);
    });
    return keys;
  }, [cheSchedule, dayRecords, userPlans]);

  const selectedOwner: DayRecordOwner = activeTab === 'mine' ? 'mine' : 'che';
  const records = useMemo(
    () => dayRecords.filter((record) => (record.dateKey ?? record.date) === selectedDateKey && record.owner === selectedOwner),
    [dayRecords, selectedDateKey, selectedOwner],
  );
  const activityRecords = records.filter((record) => record.kind === 'activity');
  const letterRecords = records.filter((record) => record.kind === 'letter');

  const selectDate = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    setCalendarMonth(parseDateKey(dateKey));
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
