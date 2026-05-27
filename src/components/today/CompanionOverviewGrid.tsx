// CompanionOverviewGrid renders the soft 2x2 summary for "you and Che today".
// Keep this as a lightweight overview; detailed editing belongs in Arrange.
import { ChatSoftIcon, CheStatusIcon, ClockSoftIcon, PlanCardIcon, SproutIcon } from '../icons';

interface CompanionOverviewGridProps {
  companionshipTitle: string;
  companionshipDetail: string;
  deepTalkTitle: string;
  deepTalkDetail: string;
  userTitle: string;
  userDetail: string;
  cheTitle: string;
  cheDetail: string;
  onOpenCompanionship: () => void;
  onOpenDeep: () => void;
  onOpenUser: () => void;
  onOpenChe: () => void;
}

const overviewCards = [
  { key: 'companionship', label: '今日相伴', Icon: ClockSoftIcon },
  { key: 'deep', label: '安静聊聊', Icon: ChatSoftIcon },
  { key: 'user', label: '我的计划', Icon: PlanCardIcon },
  { key: 'che', label: '澈的状态', Icon: CheStatusIcon },
] as const;

export function CompanionOverviewGrid({
  companionshipTitle,
  companionshipDetail,
  deepTalkTitle,
  deepTalkDetail,
  userTitle,
  userDetail,
  cheTitle,
  cheDetail,
  onOpenCompanionship,
  onOpenDeep,
  onOpenUser,
  onOpenChe,
}: CompanionOverviewGridProps) {
  const data = {
    companionship: { value: companionshipTitle, desc: companionshipDetail, onClick: onOpenCompanionship },
    deep: { value: deepTalkTitle, desc: deepTalkDetail, onClick: onOpenDeep },
    user: { value: userTitle, desc: userDetail, onClick: onOpenUser },
    che: { value: cheTitle, desc: cheDetail, onClick: onOpenChe },
  };

  return (
    <section className="overview-section" aria-labelledby="overview-title">
      <div className="section-heading">
        <h2 id="overview-title">你和澈今天</h2>
      </div>

      <div className="companion-grid">
        {overviewCards.map(({ key, label, Icon }) => (
          <button className="companion-grid-card" type="button" key={key} onClick={data[key].onClick}>
            <span className="overview-icon" aria-hidden="true">
              <Icon size={20} />
            </span>
            <p className="card-label">{label}</p>
            <h3>{data[key].value}</h3>
            <p className="overview-detail">{data[key].desc}</p>
            <SproutIcon className="card-sprout" size={46} aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}
