import type { DateItem, MonthDateItem } from '../../utils/date';

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
  return (
    <section className="arrange-date-area" aria-label="日期选择">
      <div className="arrange-date-toolbar">
        {isCalendarExpanded ? (
          <div className="arrange-calendar-head">
            <h2>{calendarMonthLabel}</h2>
            <button className="calendar-toggle-button" type="button" onClick={onToggleCalendar}>
              收起
            </button>
          </div>
        ) : (
          <>
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
            <button className="calendar-toggle-button" type="button" onClick={onToggleCalendar}>
              展开
            </button>
          </>
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
