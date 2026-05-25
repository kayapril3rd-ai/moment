// CheScheduleList renders Che's day as natural life scenes, not editable tasks.
// Images are absolutely clipped inside the card container.
import type { CSSProperties } from 'react';
import type { CheScheduleItem } from '../../types/che';
import { ChatSoftIcon, ClockSoftIcon, SproutIcon, TodayBubbleIcon } from '../icons/SoftIcons';

interface CheScheduleListProps {
  schedule: CheScheduleItem[];
}

const workImageUrl = new URL('../../../场景图/work.png', import.meta.url).href;
const cookingImageUrl = new URL('../../../场景图/cooking.png', import.meta.url).href;
const parkImageUrl = new URL('../../../场景图/park.png', import.meta.url).href;
const primeImageUrl = new URL('../../../场景图/prime.png', import.meta.url).href;

const cheSceneCards = [
  {
    id: 'project-wrap',
    icon: 'sun',
    timeLabel: '上午',
    title: '收尾项目',
    desc: '还在整理体验评审稿',
    statusText: '状态：忙碌中',
    statusType: 'busy',
    imageUrl: workImageUrl,
    action: null,
    imagePosition: '58% center',
  },
  {
    id: 'coffee-break',
    icon: 'coffee',
    timeLabel: '下午',
    title: '咖啡休息',
    desc: '想去窗边缓一会儿',
    statusText: '',
    statusType: 'normal',
    imageUrl: cookingImageUrl,
    action: '去找他',
    imagePosition: 'center',
  },
  {
    id: 'walk-relax',
    icon: 'walk',
    timeLabel: '晚些时候',
    title: '散步放松',
    desc: '如果你愿意可以一起',
    statusText: '',
    statusType: 'normal',
    imageUrl: parkImageUrl,
    action: '邀请一起',
    imagePosition: 'center',
  },
  {
    id: 'free-night',
    icon: 'moon',
    timeLabel: '20:30后',
    title: '空下来',
    desc: '适合轻松聊聊',
    statusText: '状态：可陪伴',
    statusType: 'available',
    imageUrl: primeImageUrl,
    action: null,
    imagePosition: 'center',
  },
] as const;

export function CheScheduleList({ schedule }: CheScheduleListProps) {
  const hasInviteItems = schedule.some((item) => item.type === 'shared');
  const cards = hasInviteItems ? cheSceneCards : cheSceneCards;

  return (
    <div className="che-scene-list" aria-label="澈的今日安排">
      {cards.map((item) => (
        <article className="che-scene-card" key={item.id} style={{ '--image-position': item.imagePosition } as CSSProperties}>
          <img className="scene-card-image" src={item.imageUrl} alt="" />
          <span className="scene-card-overlay" aria-hidden="true" />
          <div className="che-scene-content">
            <span className="che-scene-icon" aria-hidden="true">
              <CheIcon icon={item.icon} />
            </span>
            <span className="che-scene-copy">
              <small>{item.timeLabel}</small>
              <strong>{item.title}</strong>
              <p>{item.desc}</p>
              {item.statusText ? <em className={`che-status-${item.statusType}`}>{item.statusText}</em> : null}
            </span>
          </div>
          {item.action ? (
            <button className="che-scene-action" type="button">
              {item.action}
            </button>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function CheIcon({ icon }: { icon: string }) {
  if (icon === 'sun') return <ClockSoftIcon size={26} />;
  if (icon === 'coffee') return <TodayBubbleIcon size={26} />;
  if (icon === 'walk') return <SproutIcon size={26} />;
  return <ChatSoftIcon size={26} />;
}
