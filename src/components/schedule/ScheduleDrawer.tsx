// ScheduleDrawer 负责“今日安排”的可编辑抽屉：添加计划、查看我的/澈的安排、邀请澈。
// 首页概览卡的只读查看不走这里，避免“查看今天”和“管理安排”混在一起。
import type { CheScheduleItem, UserPlan } from '../../types/che';
import { CheScheduleList } from './CheScheduleList';
import { UserPlanList } from './UserPlanList';

export type ScheduleTab = 'user' | 'che';

interface ScheduleDrawerProps {
  isOpen: boolean;
  activeTab: ScheduleTab;
  userPlans: UserPlan[];
  cheSchedule: CheScheduleItem[];
  onAddPlan: (input: string) => boolean;
  onInvitePlan: (planId: string) => void;
  onSelectPlan: (plan: UserPlan) => void;
  onClose: () => void;
  onTabChange: (tab: ScheduleTab) => void;
}

export function ScheduleDrawer({
  isOpen,
  activeTab,
  userPlans,
  cheSchedule,
  onAddPlan,
  onInvitePlan,
  onSelectPlan,
  onClose,
  onTabChange,
}: ScheduleDrawerProps) {
  return (
    <div className={`schedule-drawer-layer ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
      <button className="schedule-scrim" type="button" aria-label="关闭今日安排" onClick={onClose} />

      <section
        className="schedule-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-drawer-title"
      >
        <div className="drawer-handle" aria-hidden="true" />

        <header className="drawer-header">
          <div>
            <h2 id="schedule-drawer-title">今日安排</h2>
          </div>
          <button className="drawer-close" type="button" aria-label="关闭" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="schedule-segmented" role="tablist" aria-label="安排类型">
          <button
            className={activeTab === 'user' ? 'is-active' : ''}
            type="button"
            role="tab"
            aria-selected={activeTab === 'user'}
            onClick={() => onTabChange('user')}
          >
            我的
          </button>
          <button
            className={activeTab === 'che' ? 'is-active' : ''}
            type="button"
            role="tab"
            aria-selected={activeTab === 'che'}
            onClick={() => onTabChange('che')}
          >
            澈的
          </button>
        </div>

        <div className="drawer-content">
          {activeTab === 'user' ? (
            <UserPlanList plans={userPlans} onAddPlan={onAddPlan} onInvite={onInvitePlan} onSelectPlan={onSelectPlan} />
          ) : (
            <CheScheduleList schedule={cheSchedule} />
          )}
        </div>
      </section>
    </div>
  );
}
