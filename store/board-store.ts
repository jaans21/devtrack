"use client";

import { create } from "zustand";
import type { IssueStatus } from "@prisma/client";

export type BoardIssue = {
  id: string;
  title: string;
  status: IssueStatus;
  priority: string;
  position: number;
  assignee?: { id: string; name: string | null; image: string | null } | null;
  labels?: { label: { name: string; color: string } }[];
  _count?: { comments: number };
};

type BoardState = {
  columns: Record<IssueStatus, BoardIssue[]>;
  setColumns: (columns: Record<IssueStatus, BoardIssue[]>) => void;
  moveCard: (issueId: string, toStatus: IssueStatus, toIndex: number) => void;
  snapshot: Record<IssueStatus, BoardIssue[]> | null;
  saveSnapshot: () => void;
  rollback: () => void;
};

const EMPTY_COLUMNS: Record<IssueStatus, BoardIssue[]> = {
  BACKLOG: [],
  TODO: [],
  IN_PROGRESS: [],
  IN_REVIEW: [],
  DONE: [],
  CANCELLED: [],
};

export const useBoardStore = create<BoardState>((set, get) => ({
  columns: EMPTY_COLUMNS,
  snapshot: null,

  setColumns: (columns) => set({ columns }),

  saveSnapshot: () => set({ snapshot: structuredClone(get().columns) }),

  rollback: () => {
    const { snapshot } = get();
    if (snapshot) set({ columns: snapshot, snapshot: null });
  },

  moveCard: (issueId, toStatus, toIndex) => {
    const columns = structuredClone(get().columns);

    // Find and remove from current column
    let card: BoardIssue | undefined;
    for (const status of Object.keys(columns) as IssueStatus[]) {
      const idx = columns[status].findIndex((c) => c.id === issueId);
      if (idx !== -1) {
        [card] = columns[status].splice(idx, 1);
        break;
      }
    }
    if (!card) return;

    card.status = toStatus;
    columns[toStatus].splice(toIndex, 0, card);
    set({ columns });
  },
}));
