// BottomNav keeps the MVP to three main entrances: Today, Arrange, Mine.
// Icon style is local rounded line art so the nav stays aligned with the 此刻 logo.
import { CalendarSoftIcon, TodayBubbleIcon, UserSoftIcon } from '../icons/SoftIcons';

export type MainTab = 'today' | 'arrange' | 'mine';

interface BottomNavProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

const tabs = [
  { id: 'today', label: '今天', Icon: TodayBubbleIcon },
  { id: 'arrange', label: '安排', Icon: CalendarSoftIcon },
  { id: 'mine', label: '我的', Icon: UserSoftIcon },
] satisfies Array<{ id: MainTab; label: string; Icon: typeof TodayBubbleIcon }>;

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="主导航">
      {tabs.map(({ id, label, Icon }) => (
        <button
          className={`bottom-nav-button${activeTab === id ? ' is-active' : ''}`}
          type="button"
          key={id}
          onClick={() => onTabChange(id)}
          aria-current={activeTab === id ? 'page' : undefined}
        >
          <span className="bottom-nav-icon" aria-hidden="true">
            <Icon size={23} />
          </span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
