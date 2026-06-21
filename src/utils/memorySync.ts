export type MemoryCandidate = {
  id: string;
  content: string;
  source: 'chat' | 'manual';
  createdAt: string;
  confirmed: boolean;
};

export function createMemoryCandidateFromChat(content: string): MemoryCandidate {
  return {
    id: crypto.randomUUID(),
    content,
    source: 'chat',
    createdAt: new Date().toISOString(),
    confirmed: false,
  };
}

export function confirmMemoryCandidate(candidate: MemoryCandidate): MemoryCandidate {
  return {
    ...candidate,
    confirmed: true,
  };
}
