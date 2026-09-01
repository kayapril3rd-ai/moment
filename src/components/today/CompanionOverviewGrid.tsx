import { CatHeadIcon, CompanionBubbleIcon, DogHeadIcon, PlanClipboardIcon, SproutIcon } from '../icons';

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
  { key: 'companionship', label: '今日相伴', Icon: CompanionBubbleIcon },
  { key: 'deep', label: '安静聊聊', Icon: CatHeadIcon },
  { key: 'user', label: '我的计划', Icon: PlanClipboardIcon },
  { key: 'che', label: '澈的状态', Icon: DogHeadIcon },
] as const;

function toShortHint(text: string) {
  const normalized = text.replace(/\s+/g, '');
  return normalized.length > 8 ? normalized.slice(0, 8) : normalized;
}

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
            <span className="summary-card-header">
              <span className="overview-icon summary-card-icon" aria-hidden="true">
                <Icon size={22} />
              </span>
              <span className="card-label summary-card-title">{label}</span>
            </span>
            <h3 className={`summary-card-value ${data[key].value.includes('：') ? 'is-compact' : ''}`}>{data[key].value}</h3>
            <p className="overview-detail summary-card-hint">{toShortHint(data[key].desc)}</p>
            <SproutIcon className="card-sprout" size={46} aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}
