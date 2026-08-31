import { useCallback, useEffect, useState } from 'react';
import type { ChatSummaryMemoryItem } from '../types/chatSummary';
import type { ConversationMemory } from '../types/memory';
import {
  addConversationMemories,
  clearConversationMemoryStorage,
  readConversationMemories,
  writeConversationMemories,
} from '../utils/conversationMemoryStorage';

export function useConversationMemory() {
  const [conversationMemories, setConversationMemories] = useState<ConversationMemory[]>(
    () => readConversationMemories(),
  );

  useEffect(() => {
    writeConversationMemories(conversationMemories);
  }, [conversationMemories]);

  const addFromSummary = useCallback((
    items: ChatSummaryMemoryItem[],
    sourceDate: string,
    sourceRecordId: string,
    explicitMemoryItems: string[],
  ) => {
    setConversationMemories((current) => addConversationMemories(
      current,
      items,
      sourceDate,
      sourceRecordId,
      explicitMemoryItems,
    ));
  }, []);

  const clearConversationMemories = useCallback(() => {
    clearConversationMemoryStorage();
    setConversationMemories([]);
  }, []);

  return {
    conversationMemories,
    addFromSummary,
    clearConversationMemories,
  };
}
