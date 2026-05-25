// ActivitySetup 负责 flexible 无时间活动的准备弹层。
// “定个时间”只编辑当前活动，不跳到完整日程抽屉，避免打断用户当前意图。
import { FormEvent, useState } from 'react';
import type { SceneCard } from '../../types/che';

interface ActivitySetupProps {
  card: SceneCard;
  onClose: () => void;
  onStart: () => void;
  onSchedule: (timeLabel: string) => void;
}

export function ActivitySetup({ card, onClose, onStart, onSchedule }: ActivitySetupProps) {
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState('');

  const handleSaveTime = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextTime = timeInput.trim();

    if (!nextTime) {
      return;
    }

    onSchedule(nextTime);
  };

  return (
    <div className="activity-layer" role="presentation">
      <button className="activity-scrim" type="button" aria-label="关闭活动准备" onClick={onClose} />
      <section className="activity-sheet" role="dialog" aria-modal="true" aria-labelledby="activity-setup-title">
        <p className="activity-eyebrow">{card.timeLabel ?? card.timeHint}</p>
        <h2 id="activity-setup-title">{isEditingTime ? '定个时间' : card.title}</h2>

        {isEditingTime ? (
          <form className="activity-time-form" onSubmit={handleSaveTime}>
            <label htmlFor="activity-time-input">时间</label>
            <input
              id="activity-time-input"
              type="text"
              placeholder="比如 20:30"
              value={timeInput}
              onChange={(event) => setTimeInput(event.target.value)}
            />
            <p>也可以写“晚上”或“睡前”，不用填成严格日程。</p>
            <div className="activity-actions activity-actions-inline">
              <button className="activity-action-primary" type="submit">保存</button>
              <button className="activity-action-secondary" type="button" onClick={() => setIsEditingTime(false)}>
                取消
              </button>
            </div>
          </form>
        ) : (
          <>
            <p>这件事还没定具体时间。你们可以随时开始，也可以先留到晚点。</p>

            <div className="activity-actions activity-actions-compact">
              <button className="activity-action-primary" type="button" onClick={onStart}>现在开始</button>
              <button className="activity-action-secondary" type="button" onClick={() => setIsEditingTime(true)}>
                定个时间
              </button>
              <button className="activity-action-ghost" type="button" onClick={onClose}>稍后再说</button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
