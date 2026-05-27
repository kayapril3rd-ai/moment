import type { ArrangeTab } from '../../hooks/useArrangeDateState';

interface ArrangeSegmentedTabsProps {
  activeTab: ArrangeTab;
  onTabChange: (tab: ArrangeTab) => void;
}

export function ArrangeSegmentedTabs({ activeTab, onTabChange }: ArrangeSegmentedTabsProps) {
  return (
    <div className="schedule-segmented arrange-segmented" role="tablist" aria-label="安排视图">
      <button className={activeTab === 'mine' ? 'is-active' : ''} type="button" onClick={() => onTabChange('mine')}>
        我的
      </button>
      <button className={activeTab === 'che' ? 'is-active' : ''} type="button" onClick={() => onTabChange('che')}>
        澈的
      </button>
    </div>
  );
}
