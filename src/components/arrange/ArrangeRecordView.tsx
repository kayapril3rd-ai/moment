import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { createPortal } from 'react-dom';
import type { ArrangeTab } from '../../hooks/useArrangeDateState';
import type { CheScheduleItem, DayRecord } from '../../types/che';
import { sceneRegistry } from '../../data';
import { ArrowRightSoftIcon, CloseSoftIcon, SproutIcon } from '../icons';
import { ArrangeSegmentedTabs } from './ArrangeSegmentedTabs';

interface ArrangeRecordViewProps {
  activeTab: ArrangeTab;
  activityRecords: DayRecord[];
  letterRecords: DayRecord[];
  cheSchedule: CheScheduleItem[];
  selectedMonthDay: string;
  onTabChange: (tab: ArrangeTab) => void;
  onDeleteChatRecord: (recordId: string) => void;
}

export function ArrangeRecordView({
  activeTab,
  activityRecords,
  letterRecords,
  cheSchedule,
  selectedMonthDay,
  onTabChange,
  onDeleteChatRecord,
}: ArrangeRecordViewProps) {
  return (
    <section className="day-record-view" aria-labelledby="day-record-title">
      <h2 className="sr-only" id="day-record-title">{selectedMonthDay}的记录</h2>
      <ArrangeSegmentedTabs activeTab={activeTab} onTabChange={onTabChange} />

      <div className="record-block">
        <h3>活动记录</h3>
        {activeTab === 'che' ? (
          cheSchedule.length > 0 ? (
            <div className="che-history-timeline">
              {cheSchedule.map((item) => (
                <article className="che-history-item" key={item.id}>
                  <div className="che-history-rail" aria-hidden="true">
                    <span className="che-history-dot" />
                  </div>
                  <div className="che-history-content">
                    <time className="che-history-time">{item.timeLabel ?? item.startTime}</time>
                    <strong className="che-history-title">{item.title}</strong>
                    <p className="che-history-detail">{item.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="record-empty">这一天还没有活动记录。</p>
          )
        ) : (
          <div className="record-timeline">
            {activityRecords.length > 0 ? (
              activityRecords.map((record) => (
                <article className="record-item" key={record.id}>
                  <time className="record-time">{record.timeLabel}</time>
                  <span className="record-dot" aria-hidden="true" />
                  <div className="record-main">
                    <strong className="record-title">{record.title}</strong>
                    <p className="record-desc">{record.summary}</p>
                  </div>
                  <span className="record-status">{record.status === 'completed' ? '已完成' : '进行中'}</span>
                </article>
              ))
            ) : (
              <p className="record-empty">这一天还没有活动记录。</p>
            )}
          </div>
        )}
      </div>

      {activeTab === 'mine' ? <ChatLetterSection letterRecords={letterRecords} onDeleteLetter={onDeleteChatRecord} /> : null}
    </section>
  );
}

interface TranscriptMessage {
  role: 'che' | 'user';
  content: string;
}

interface LetterContextMenu {
  letterId: string;
  left: number;
  top: number;
}

interface PressStart {
  x: number;
  y: number;
}

interface CardBounds {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const longPressDelay = 480;
const longPressMoveTolerance = 8;
const contextMenuWidth = 56;
const contextMenuTouchHeight = 44;
const contextMenuViewportInset = 8;

export function ChatLetterSection({
  letterRecords,
  onDeleteLetter,
}: {
  letterRecords: DayRecord[];
  onDeleteLetter: (recordId: string) => void;
}) {
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<LetterContextMenu | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const pressStartRef = useRef<PressStart | null>(null);
  const suppressClickRef = useRef(false);
  const selectedLetter = letterRecords.find((letter) => letter.id === selectedLetterId) ?? null;
  const transcript = selectedLetter ? parseLetterTranscript(selectedLetter.detail ?? '') : null;

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  useEffect(() => () => clearLongPressTimer(), []);

  const openContextMenu = (
    letterId: string,
    pointerX: number,
    pointerY: number,
    cardBounds: CardBounds,
  ) => {
    const minimumLeft = Math.max(cardBounds.left + 8, contextMenuViewportInset);
    const maximumLeft = Math.min(
      cardBounds.right - contextMenuWidth - 8,
      window.innerWidth - contextMenuWidth - contextMenuViewportInset,
    );
    const left = Math.min(
      Math.max(pointerX - contextMenuWidth / 2, minimumLeft),
      Math.max(minimumLeft, maximumLeft),
    );
    const minimumTop = Math.max(cardBounds.top + 4, contextMenuViewportInset);
    const maximumTop = Math.min(
      cardBounds.bottom - contextMenuTouchHeight - 4,
      window.innerHeight - contextMenuTouchHeight - contextMenuViewportInset,
    );
    const top = Math.min(
      Math.max(pointerY - contextMenuTouchHeight / 2, minimumTop),
      Math.max(minimumTop, maximumTop),
    );
    setContextMenu({ letterId, left, top });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>, letterId: string) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    clearLongPressTimer();
    setContextMenu(null);
    suppressClickRef.current = false;
    const pointerX = event.clientX;
    const pointerY = event.clientY;
    const { top, right, bottom, left } = event.currentTarget.getBoundingClientRect();
    pressStartRef.current = { x: pointerX, y: pointerY };
    longPressTimerRef.current = window.setTimeout(() => {
      suppressClickRef.current = true;
      openContextMenu(letterId, pointerX, pointerY, { top, right, bottom, left });
      longPressTimerRef.current = null;
    }, longPressDelay);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const pressStart = pressStartRef.current;
    if (!pressStart) return;
    if (Math.hypot(event.clientX - pressStart.x, event.clientY - pressStart.y) > longPressMoveTolerance) {
      clearLongPressTimer();
      pressStartRef.current = null;
    }
  };

  const finishPointerPress = () => {
    clearLongPressTimer();
    pressStartRef.current = null;
  };

  const handleLetterClick = (event: ReactMouseEvent<HTMLButtonElement>, letterId: string) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      suppressClickRef.current = false;
      return;
    }
    setContextMenu(null);
    setSelectedLetterId(letterId);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    onDeleteLetter(pendingDeleteId);
    if (selectedLetterId === pendingDeleteId) setSelectedLetterId(null);
    setPendingDeleteId(null);
  };

  return (
    <>
      <div className="record-block chat-letter-section">
        <h3>聊天信件</h3>
        {letterRecords.length > 0 ? (
          letterRecords.map((letter) => (
            <button
              className="letter-card"
              key={letter.id}
              type="button"
              onClick={(event) => handleLetterClick(event, letter.id)}
              onContextMenu={(event) => event.preventDefault()}
              onPointerDown={(event) => handlePointerDown(event, letter.id)}
              onPointerMove={handlePointerMove}
              onPointerUp={finishPointerPress}
              onPointerCancel={finishPointerPress}
              onPointerLeave={finishPointerPress}
            >
              <div className="letter-copy">
                <strong>{letter.title}</strong>
                <p>{letter.summary}</p>
                <span className="letter-meta">{getLetterSceneLabel(letter)} · {letter.timeLabel}</span>
              </div>
              <ArrowRightSoftIcon className="letter-arrow" size={18} aria-hidden="true" />
            </button>
          ))
        ) : (
          <article className="letter-card is-empty">
            <p>这一天还没有留下信件。</p>
            <SproutIcon className="letter-illustration" size={128} aria-hidden="true" />
          </article>
        )}
      </div>

      {selectedLetter ? (
        <div className="letter-detail-overlay" role="presentation" onClick={() => setSelectedLetterId(null)}>
          <section
            className="letter-detail-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="letter-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="letter-detail-header">
              <div>
                <h2 id="letter-detail-title">{selectedLetter.title}</h2>
                <span>{getLetterSceneLabel(selectedLetter)} · {getLetterTimeRange(selectedLetter)}</span>
              </div>
              <button type="button" aria-label="关闭聊天记录" onClick={() => setSelectedLetterId(null)}>
                <CloseSoftIcon size={18} aria-hidden="true" />
              </button>
            </header>
            <div className="letter-detail-content">
              <h3>聊天记录</h3>
              {transcript ? (
                <div className="letter-transcript">
                  {transcript.map((message, index) => (
                    <div className={`transcript-entry is-${message.role}`} key={`${message.role}-${index}`}>
                      <span className="transcript-role">{message.role === 'che' ? '澈' : '我'}</span>
                      <p>{message.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="letter-transcript-fallback">{selectedLetter.detail}</p>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {contextMenu ? createPortal(
        <div className="letter-context-layer" role="presentation" onPointerDown={() => setContextMenu(null)}>
          <div
            className="letter-context-anchor"
            style={{ left: contextMenu.left, top: contextMenu.top }}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <button
              className="letter-context-menu"
              type="button"
              onClick={() => {
                setPendingDeleteId(contextMenu.letterId);
                setContextMenu(null);
              }}
            >
              删除
            </button>
          </div>
        </div>,
        document.body,
      ) : null}

      {pendingDeleteId ? createPortal(
        <div className="letter-delete-overlay" role="presentation" onClick={() => setPendingDeleteId(null)}>
          <section
            className="letter-delete-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="letter-delete-title"
            aria-describedby="letter-delete-description"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="letter-delete-copy">
              <h2 id="letter-delete-title">删除这条聊天记录？</h2>
              <p id="letter-delete-description">删除后无法恢复。</p>
            </div>
            <div className="letter-delete-actions">
              <button type="button" onClick={() => setPendingDeleteId(null)}>取消</button>
              <button className="is-danger" type="button" onClick={confirmDelete}>删除</button>
            </div>
          </section>
        </div>,
        document.body,
      ) : null}
    </>
  );
}

export function parseLetterTranscript(detail: string): TranscriptMessage[] | null {
  const lines = detail.replace(/\r\n?/g, '\n').split('\n');
  const messages: TranscriptMessage[] = [];
  let currentMessage: TranscriptMessage | null = null;

  for (const line of lines) {
    const roleMatch = line.match(/^\s*(澈|我)\s*[:：]\s*(.*)$/);
    if (roleMatch) {
      if (currentMessage) messages.push(currentMessage);
      currentMessage = {
        role: roleMatch[1] === '澈' ? 'che' : 'user',
        content: roleMatch[2] ?? '',
      };
      continue;
    }

    if (!currentMessage) {
      if (line.trim()) return null;
      continue;
    }

    currentMessage.content += `${currentMessage.content ? '\n' : ''}${line}`;
  }

  if (currentMessage) messages.push(currentMessage);
  if (messages.length === 0) return null;

  return messages.map((message) => ({ ...message, content: message.content.trim() }));
}

function getLetterSceneLabel(letter: DayRecord): string {
  return letter.sceneType ? sceneRegistry[letter.sceneType].shortTitle : '聊天';
}

function getLetterTimeRange(letter: DayRecord): string {
  if (letter.startedAt && letter.endedAt) return `${letter.startedAt}–${letter.endedAt}`;
  return letter.timeLabel;
}
