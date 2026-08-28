import { useState } from 'react';
import { privacyActions, type UserProfile } from '../../data/mockProfile';
import type { DayRecord, RecentMoment } from '../../types/che';
import { CloseSoftIcon } from '../icons';

type MineSheetType = 'preferences' | 'relationship' | 'memory' | 'privacy';

interface MinePageProps {
  userProfile: UserProfile;
  memoryItems: string[];
  dayRecords: DayRecord[];
  recentMoments: RecentMoment[];
  onUserProfileChange: (profile: UserProfile) => void;
  onMemoryItemsChange: (items: string[]) => void;
}

const entryCards: Array<{
  id: MineSheetType;
  title: string;
  subtitle?: string;
}> = [
  { id: 'preferences', title: '聊天偏好' },
  { id: 'relationship', title: '一起的记录' },
  { id: 'memory', title: '澈记得的事', subtitle: '关于你的细节和小事' },
  { id: 'privacy', title: '隐私', subtitle: '数据与清除' },
];

export function MinePage({ userProfile, memoryItems, dayRecords, recentMoments, onUserProfileChange, onMemoryItemsChange }: MinePageProps) {
  const [activeSheet, setActiveSheet] = useState<MineSheetType | null>(null);
  const relationshipSummary = deriveRelationshipSummary(dayRecords, recentMoments);

  return (
    <div className="tab-page mine-page" aria-label="我的">
      <header className="mine-identity-block">
        <h1>{userProfile.nickname}</h1>
        <p>关于你，也关于你们</p>
      </header>
      <section className="mine-entry-group" aria-label="设置与记录">
        {entryCards.map((card) => (
          <button
            className="mine-entry-row"
            type="button"
            key={card.id}
            onClick={() => setActiveSheet(card.id)}
          >
            <span className="mine-entry-head">
              <strong>{card.title}</strong>
            </span>
            {card.id === 'relationship' ? <RelationshipStats summary={relationshipSummary} /> : card.subtitle ? <small>{card.subtitle}</small> : null}
          </button>
        ))}
      </section>

      {activeSheet ? (
        <MineDetailSheet
          type={activeSheet}
          userProfile={userProfile}
          memoryItems={memoryItems}
          dayRecords={dayRecords}
          recentMoments={recentMoments}
          onUserProfileChange={onUserProfileChange}
          onMemoryItemsChange={onMemoryItemsChange}
          onClose={() => setActiveSheet(null)}
        />
      ) : null}
    </div>
  );
}

function RelationshipStats({ summary }: { summary: RelationshipSummary }) {
  if (summary.recordedDays === 0) return <small className="mine-empty-summary">暂无记录</small>;

  return (
    <small className="mine-relationship-summary">
      {summary.recordedDays} 天 · 安静聊聊 {summary.quietTalkCount} 次 · 一起完成 {summary.completedTogetherCount} 件
    </small>
  );
}

function MineDetailSheet({
  type,
  userProfile,
  memoryItems,
  dayRecords,
  recentMoments,
  onUserProfileChange,
  onMemoryItemsChange,
  onClose,
}: MinePageProps & { type: MineSheetType; onClose: () => void }) {
  const title = entryCards.find((card) => card.id === type)?.title ?? '我的';

  return (
    <div className="mine-modal-overlay" role="presentation" onClick={onClose}>
      <section className="mine-modal" role="dialog" aria-modal="true" aria-labelledby="mine-sheet-title" onClick={(event) => event.stopPropagation()}>
        <header className="mine-modal-header">
          <h2 id="mine-sheet-title">{title}</h2>
          <button className="mine-modal-close" type="button" aria-label="关闭" onClick={onClose}>
            <CloseSoftIcon size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="mine-sheet-content">
          {type === 'preferences' ? (
            <PreferencesForm userProfile={userProfile} onSave={onUserProfileChange} onClose={onClose} />
          ) : null}
          {type === 'relationship' ? <RelationshipDetail summary={deriveRelationshipSummary(dayRecords, recentMoments)} /> : null}
          {type === 'memory' ? <MemoryManager memoryItems={memoryItems} onChange={onMemoryItemsChange} /> : null}
          {type === 'privacy' ? <PrivacyPanel /> : null}
        </div>
      </section>
    </div>
  );
}

function PreferencesForm({ userProfile, onSave, onClose }: { userProfile: UserProfile; onSave: (profile: UserProfile) => void; onClose: () => void }) {
  const [form, setForm] = useState(userProfile);

  const updateField = (key: keyof UserProfile['preferences'], value: string) => {
    setForm((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        [key]: value,
      },
    }));
  };

  return (
    <form
      className="mine-preference-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          nickname: form.nickname.trim() || userProfile.nickname,
          preferences: {
            companionStyle: form.preferences.companionStyle.trim(),
            chatPace: form.preferences.chatPace.trim(),
            dislikes: form.preferences.dislikes.trim(),
          },
        });
        onClose();
      }}
    >
      <label>
        <span className="setting-label">澈怎么称呼我</span>
        <input className="setting-input" value={form.nickname} onChange={(event) => setForm((current) => ({ ...current, nickname: event.target.value }))} />
      </label>
      <label>
        <span className="setting-label">希望怎么回应我</span>
        <input className="setting-input" value={form.preferences.companionStyle} onChange={(event) => updateField('companionStyle', event.target.value)} />
      </label>
      <label>
        <span className="setting-label">聊天节奏</span>
        <input className="setting-input" value={form.preferences.chatPace} onChange={(event) => updateField('chatPace', event.target.value)} />
      </label>
      <label>
        <span className="setting-label">希望避免</span>
        <input className="setting-input" value={form.preferences.dislikes} onChange={(event) => updateField('dislikes', event.target.value)} />
      </label>
      <button className="mine-sheet-action" type="submit">保存偏好</button>
    </form>
  );
}

function RelationshipDetail({ summary }: { summary: RelationshipSummary }) {
  if (summary.recordedDays === 0) return <p className="mine-empty-state">暂无记录</p>;

  return (
    <div className="mine-detail-list">
      <ReadOnlyField label="有记录的日子" value={`${summary.recordedDays} 天`} />
      <ReadOnlyField label="安静聊聊" value={`${summary.quietTalkCount} 次`} />
      <ReadOnlyField label="一起完成" value={`${summary.completedTogetherCount} 件`} />
      <ReadOnlyField label="最近一起" value={summary.recentTogether ?? '暂无记录'} />
      {summary.recentMoment ? <ReadOnlyField label="最近片段" value={summary.recentMoment} /> : null}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="setting-field">
      <div className="setting-label">{label}</div>
      <div className="setting-value">{value}</div>
    </div>
  );
}

function MemoryManager({ memoryItems, onChange }: { memoryItems: string[]; onChange: (items: string[]) => void }) {
  const [draft, setDraft] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState('');
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [error, setError] = useState('');

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditingDraft(memoryItems[index] ?? '');
    setDeleteIndex(null);
    setError('');
  };

  const saveEdit = (index: number) => {
    const nextValue = editingDraft.trim();
    if (!nextValue) {
      setError('记忆内容不能为空');
      return;
    }
    onChange(memoryItems.map((item, itemIndex) => (itemIndex === index ? nextValue : item)));
    setEditingIndex(null);
    setEditingDraft('');
    setError('');
  };

  const deleteItem = (index: number) => {
    onChange(memoryItems.filter((_, itemIndex) => itemIndex !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingDraft('');
    }
    setDeleteIndex(null);
    setError('');
  };

  const addItem = () => {
    const nextItem = draft.trim();
    if (!nextItem) {
      setError('记忆内容不能为空');
      return;
    }
    onChange([...memoryItems, nextItem]);
    setDraft('');
    setError('');
  };

  return (
    <div className="mine-memory-editor">
      <div className="mine-memory-intro">
        <p>这些是澈会带进之后聊天里的事实。</p>
      </div>
      {memoryItems.length === 0 ? (
        <div className="mine-memory-empty">
          <strong>还没有记住什么。</strong>
          <p>你可以先告诉澈一件希望他别忘的事。</p>
        </div>
      ) : null}
      {memoryItems.map((item, index) => (
        <div className={`memory-card${editingIndex === index ? ' is-editing' : ''}`} key={`${item}-${index}`}>
          <button className="memory-delete" type="button" aria-label="删除记忆" onClick={() => setDeleteIndex(index)}>
            <CloseSoftIcon size={18} aria-hidden="true" />
          </button>
          {editingIndex === index ? (
            <textarea className="memory-input" value={editingDraft} aria-label={`编辑记忆 ${index + 1}`} onChange={(event) => setEditingDraft(event.target.value)} />
          ) : (
            <p className="memory-content">{item}</p>
          )}
          {deleteIndex === index ? (
            <div className="memory-confirm">
              <span>要删掉这条记忆吗？</span>
              <button type="button" onClick={() => setDeleteIndex(null)}>取消</button>
              <button className="is-warm-danger" type="button" onClick={() => deleteItem(index)}>删除</button>
            </div>
          ) : null}
          <div className="memory-actions">
            {editingIndex === index ? (
              <button className="memory-save-button" type="button" onClick={() => saveEdit(index)}>保存</button>
            ) : (
              <button className="memory-edit-button" type="button" onClick={() => startEdit(index)}>编辑</button>
            )}
          </div>
        </div>
      ))}
      {error ? <p className="memory-error">{error}</p> : null}
      <div className="setting-field mine-memory-add memory-add-card">
        <label className="setting-label" htmlFor="new-memory">新增一条记忆</label>
        <input id="new-memory" className="setting-input" placeholder="例如：我养了一只叫……的狗" value={draft} onChange={(event) => setDraft(event.target.value)} />
        <button className="mine-sheet-action" type="button" onClick={addItem}>新增记忆</button>
      </div>
    </div>
  );
}

function PrivacyPanel() {
  return (
    <div className="mine-privacy-actions">
      {privacyActions.map((item) => (
        <div className="setting-field action-row" key={item}>
          <div>
            <div className="setting-label">{item}</div>
            <div className="setting-value">暂未开放</div>
          </div>
          <button
            type="button"
            disabled
          >
            暂未开放
          </button>
        </div>
      ))}
    </div>
  );
}

interface RelationshipSummary {
  recordedDays: number;
  quietTalkCount: number;
  completedTogetherCount: number;
  recentTogether: string | null;
  recentMoment: string | null;
}

function deriveRelationshipSummary(dayRecords: DayRecord[], recentMoments: RecentMoment[]): RelationshipSummary {
  const activityRecords = dayRecords.filter((record) => record.kind === 'activity');
  const completedTogether = activityRecords.filter(
    (record) => record.owner !== 'che' && record.sceneType !== 'deep_room' && record.status === 'completed',
  );
  const recentTogether = [...completedTogether].sort((a, b) => getRecordTimestamp(b) - getRecordTimestamp(a))[0];
  const recentMoment = [...recentMoments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];

  return {
    recordedDays: new Set(dayRecords.map((record) => record.dateKey)).size,
    quietTalkCount: activityRecords.filter((record) => record.sceneType === 'deep_room').length,
    completedTogetherCount: completedTogether.length,
    recentTogether: recentTogether?.title ?? null,
    recentMoment: recentMoment?.text ?? null,
  };
}

function getRecordTimestamp(record: DayRecord): number {
  return new Date(`${record.dateKey}T${record.endedAt ?? record.startedAt ?? '00:00'}`).getTime() || 0;
}
