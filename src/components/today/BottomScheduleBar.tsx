// BottomScheduleBar 负责底部固定“今日安排”管理入口。
// 后续要改入口文案请优先改 src/data/todayCopy.ts；要改打开行为则改 TodayPage 传入的 onOpen。
interface BottomScheduleBarProps {
  title: string;
  subtitle: string;
  userCount: number;
  cheCount: number;
  onOpen: () => void;
}

export function BottomScheduleBar({ title, subtitle, userCount, cheCount, onOpen }: BottomScheduleBarProps) {
  const ariaLabel = subtitle ? `${title}，${subtitle}` : title;

  return (
    <button className="schedule-bar" type="button" aria-label={ariaLabel} onClick={onOpen}>
      <span>
        <strong>{title}</strong>
        {subtitle ? <small>{subtitle}</small> : null}
      </span>
      <span className="schedule-summary">你 {userCount} 件事 / 澈 {cheCount} 件事</span>
    </button>
  );
}
