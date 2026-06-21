import { useEffect, useState } from 'react';
import { privacyActions, relationshipStats, type UserProfile } from '../../data/mockProfile';
import { UserSoftIcon } from '../icons';

type MineSheetType = 'preferences' | 'relationship' | 'memory' | 'privacy';

interface MinePageProps {
  userProfile: UserProfile;
  memoryItems: string[];
  onUserProfileChange: (profile: UserProfile) => void;
  onMemoryItemsChange: (items: string[]) => void;
}

const entryCards: Array<{
  id: MineSheetType;
  title: string;
  subtitle?: string;
}> = [
  { id: 'preferences', title: '我的偏好' },
  { id: 'relationship', title: '关系记录' },
  { id: 'memory', title: '记忆管理', subtitle: '查看澈记得的小事' },
  { id: 'privacy', title: '隐私', subtitle: '数据、记忆与清除入口' },
];

export function MinePage({ userProfile, memoryItems, onUserProfileChange, onMemoryItemsChange }: MinePageProps) {
  const [activeSheet, setActiveSheet] = useState<MineSheetType | null>(null);

  return (
    <div className="tab-page mine-page">
      <header className="tab-page-header mine-page-header">
        <span className="page-title-lockup">
          <UserSoftIcon className="page-title-icon" size={32} aria-hidden="true" />
          <h1>我的</h1>
        </span>
      </header>

      <section className="mine-entry-stack" aria-label="我的">
        {entryCards.map((card) => (
          <button
            className={`mine-entry-card${card.id === 'relationship' ? ' mine-entry-card-stats' : ''}`}
            type="button"
            key={card.id}
            onClick={() => setActiveSheet(card.id)}
          >
            <span className="mine-entry-head">
              <strong>{card.title}</strong>
              <span aria-hidden="true">&gt;</span>
            </span>
            {card.id === 'relationship' ? <RelationshipStats /> : card.subtitle ? <small>{card.subtitle}</small> : null}
          </button>
        ))}
      </section>

      {activeSheet ? (
        <MineDetailSheet
          type={activeSheet}
          userProfile={userProfile}
          memoryItems={memoryItems}
          onUserProfileChange={onUserProfileChange}
          onMemoryItemsChange={onMemoryItemsChange}
          onClose={() => setActiveSheet(null)}
        />
      ) : null}
    </div>
  );
}

function RelationshipStats() {
  return (
    <div className="mine-stat-row" aria-label="关系记录">
      <span>
        <small>已相伴</small>
        <strong>{relationshipStats.companionDays}<em>天</em></strong>
      </span>
      <span>
        <small>深聊</small>
        <strong>{relationshipStats.deepChatCount}<em>次</em></strong>
      </span>
      <span>
        <small>一起完成</small>
        <strong>{relationshipStats.completedTogetherCount}<em>件小事</em></strong>
      </span>
    </div>
  );
}

function MineDetailSheet({
  type,
  userProfile,
  memoryItems,
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
          <button className="mine-modal-close" type="button" aria-label="关闭" onClick={onClose}>×</button>
        </header>
        <div className="mine-sheet-content">
          {type === 'preferences' ? (
            <PreferencesForm userProfile={userProfile} onSave={onUserProfileChange} onClose={onClose} />
          ) : null}
          {type === 'relationship' ? <RelationshipDetail /> : null}
          {type === 'memory' ? <MemoryManager memoryItems={memoryItems} onChange={onMemoryItemsChange} /> : null}
          {type === 'privacy' ? <PrivacyPanel /> : null}
        </div>
      </section>
    </div>
  );
}

function PreferencesForm({ userProfile, onSave, onClose }: { userProfile: UserProfile; onSave: (profile: UserProfile) => void; onClose: () => void }) {
  const [form, setForm] = useState(userProfile);

  useEffect(() => {
    setForm(userProfile);
  }, [userProfile]);

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
            commonScenes: form.preferences.commonScenes.trim(),
            chatPace: form.preferences.chatPace.trim(),
            dislikes: form.preferences.dislikes.trim(),
          },
        });
        onClose();
      }}
    >
      <label>
        <span className="setting-label">你希望澈如何称呼你</span>
        <input className="setting-input" value={form.nickname} onChange={(event) => setForm((current) => ({ ...current, nickname: event.target.value }))} />
      </label>
      <label>
        <span className="setting-label">喜欢的陪伴方式</span>
        <input className="setting-input" value={form.preferences.companionStyle} onChange={(event) => updateField('companionStyle', event.target.value)} />
      </label>
      <label>
        <span className="setting-label">常用场景</span>
        <input className="setting-input" value={form.preferences.commonScenes} onChange={(event) => updateField('commonScenes', event.target.value)} />
      </label>
      <label>
        <span className="setting-label">聊天节奏</span>
        <input className="setting-input" value={form.preferences.chatPace} onChange={(event) => updateField('chatPace', event.target.value)} />
      </label>
      <label>
        <span className="setting-label">不喜欢</span>
        <input className="setting-input" value={form.preferences.dislikes} onChange={(event) => updateField('dislikes', event.target.value)} />
      </label>
      <button className="mine-sheet-action" type="submit">保存偏好</button>
    </form>
  );
}

function RelationshipDetail() {
  return (
    <div className="mine-detail-list">
      <ReadOnlyField label="已相伴" value={`${relationshipStats.companionDays} 天`} />
      <ReadOnlyField label="深聊" value={`${relationshipStats.deepChatCount} 次`} />
      <ReadOnlyField label="一起完成" value={`${relationshipStats.completedTogetherCount} 件小事`} />
      <ReadOnlyField label="最近一次陪伴" value={relationshipStats.recentCompanion} />
      <ReadOnlyField label="最近一次深聊" value={relationshipStats.recentDeepChat} />
      <div className="setting-field setting-sync-field">
        <div>
          <div className="setting-label">同步状态</div>
          <div className="setting-value">尚未同步</div>
        </div>
        <button className="mine-light-action" type="button">重新同步</button>
      </div>
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
      {memoryItems.map((item, index) => (
        <div className={`memory-card${editingIndex === index ? ' is-editing' : ''}`} key={`${item}-${index}`}>
          <button className="memory-delete" type="button" aria-label="删除记忆" onClick={() => setDeleteIndex(index)}>×</button>
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
        <input id="new-memory" className="setting-input" placeholder="写一件澈需要记住的小事" value={draft} onChange={(event) => setDraft(event.target.value)} />
        <button className="mine-sheet-action" type="button" onClick={addItem}>新增记忆</button>
      </div>
    </div>
  );
}

function PrivacyPanel() {
  const [confirmText, setConfirmText] = useState('');

  return (
    <div className="mine-privacy-actions">
      {privacyActions.map((item, index) => (
        <div className="setting-field action-row" key={item}>
          <div>
            <div className="setting-label">{item}</div>
            <div className="setting-value">点击后先确认</div>
          </div>
          <button
            className={index < 2 ? 'is-warm-danger' : ''}
            type="button"
            onClick={() => setConfirmText(`${item} 只是预留入口，本轮不会真的执行。`)}
          >
            操作
          </button>
        </div>
      ))}
      {confirmText ? <p className="mine-privacy-confirm">{confirmText}</p> : null}
    </div>
  );
}
