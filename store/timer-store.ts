"use client";

import { create } from "zustand";

interface TimerState {
  activeEntryId: string | null;
  activeIssueId: string | null;
  startedAt: Date | null;
  elapsed: number;
  setActiveTimer: (entryId: string, issueId: string, startedAt: Date) => void;
  clearTimer: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  activeEntryId: null,
  activeIssueId: null,
  startedAt: null,
  elapsed: 0,

  setActiveTimer: (entryId, issueId, startedAt) => {
    const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
    set({ activeEntryId: entryId, activeIssueId: issueId, startedAt, elapsed });
  },

  clearTimer: () => set({ activeEntryId: null, activeIssueId: null, startedAt: null, elapsed: 0 }),

  tick: () => {
    const { startedAt } = get();
    if (!startedAt) return;
    set({ elapsed: Math.floor((Date.now() - startedAt.getTime()) / 1000) });
  },
}));
