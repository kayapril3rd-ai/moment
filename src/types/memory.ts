export type ConversationMemoryKind = 'fact' | 'event';

export interface ConversationMemory {
  id: string;
  kind: ConversationMemoryKind;
  text: string;
  sourceDate: string;
  sourceRecordId: string;
  createdAt: string;
  updatedAt: string;
}
