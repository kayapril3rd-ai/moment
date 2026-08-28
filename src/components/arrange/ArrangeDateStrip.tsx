import { parseDateKey, toDateKey, type DateItem, type MonthDateItem } from '../../utils/date';

interface ArrangeDateStripProps {
  calendarMonthLabel: string;
  contentDateKeys: Set<string>;
  dateStrip: DateItem[];
  isCalendarExpanded: boolean;
  monthDays: MonthDateItem[];
  selectedDateKey: string;
  onSelectDate: (dateKey: string) => void;
  onToggleCalendar: () => void;
}

export function ArrangeDateStrip({
  calendarMonthLabel,
  contentDateKeys,
  dateStrip,
  isCalendarExpanded,
  monthDays,
  selectedDateKey,
  onSelectDate,
  onToggleCalendar,
}: ArrangeDateStripProps) {
  const selectedDate = parseDateKey(selectedDateKey);
  const selectedDateContext = `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日 · ${weekdays[selectedDate.getDay()]}`;
  const isSelectedToday = selectedDateKey === toDateKey(new Date());

  return (
    <section className="arrange-date-area" aria-label="日期选择">
      <div className="arrange-selected-date-row">
        <div className="arrange-selected-date-copy">
          <strong>{selectedDateContext}</strong>
          {isSelectedToday ? <span>今天</span> : null}
        </div>
        <button className="calendar-toggle-button" type="button" onClick={onToggleCalendar}>
          {isCalendarExpanded ? '收起' : '展开'}
        </button>
      </div>

      <div className="arrange-date-toolbar">
        {isCalendarExpanded ? (
          <div className="arrange-calendar-head">
            <h2>{calendarMonthLabel}</h2>
          </div>
        ) : (
          <div className="date-strip date-strip-circles">
            {dateStrip.map((item) => (
              <button
                className={`date-pill${selectedDateKey === item.dateKey ? ' is-active' : ''}`}
                type="button"
                key={item.dateKey}
                onClick={() => onSelectDate(item.dateKey)}
                aria-label={`${item.dayNumber}日`}
              >
                <span>{item.dayNumber}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {isCalendarExpanded ? (
        <div className="arrange-calendar-panel">
          <div className="arrange-calendar-grid">
            {monthDays.map((item) => (
              <button
                className={[
                  'arrange-calendar-day',
                  item.dateKey === selectedDateKey ? 'is-active' : '',
                  item.isToday ? 'is-today' : '',
                  item.isCurrentMonth ? '' : 'is-muted',
                  contentDateKeys.has(item.dateKey) ? 'has-content' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                type="button"
                key={item.dateKey}
                onClick={() => onSelectDate(item.dateKey)}
                aria-label={`${item.dayNumber}日`}
              >
                <span>{item.dayNumber}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] as const;
