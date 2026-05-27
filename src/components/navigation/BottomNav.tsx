// BottomNav keeps the MVP to three main entrances: Today, Arrange, Mine.
// Icons use the local Che vector system so the app avoids mixed icon styles.
import type { ReactElement } from 'react';
import { ArrangeIcon, MineIcon, TodayIcon, type IconProps } from '../icons';

export type MainTab = 'today' | 'arrange' | 'mine';

interface BottomNavProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

const tabs = [
  { id: 'today', label: '今天', Icon: TodayIcon },
  { id: 'arrange', label: '安排', Icon: ArrangeIcon },
  { id: 'mine', label: '我的', Icon: MineIcon },
] satisfies Array<{ id: MainTab; label: string; Icon: (props: IconProps) => ReactElement }>;

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
