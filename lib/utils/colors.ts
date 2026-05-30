import type { IssueStatus, IssuePriority } from "@prisma/client";

export const STATUS_COLORS: Record<IssueStatus, { bg: string; text: string; dot: string }> = {
  BACKLOG: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  TODO: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  IN_PROGRESS: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  IN_REVIEW: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  DONE: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  CANCELLED: { bg: "bg-slate-50", text: "text-slate-500", dot: "bg-slate-300" },
};

export const PRIORITY_COLORS: Record<IssuePriority, { text: string; icon: string }> = {
  URGENT: { text: "text-red-600", icon: "text-red-500" },
  HIGH: { text: "text-orange-600", icon: "text-orange-500" },
  MEDIUM: { text: "text-yellow-600", icon: "text-yellow-500" },
  LOW: { text: "text-blue-600", icon: "text-blue-400" },
  NO_PRIORITY: { text: "text-slate-400", icon: "text-slate-300" },
};

export const STATUS_LABELS: Record<IssueStatus, string> = {
  BACKLOG: "Backlog",
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

export const PRIORITY_LABELS: Record<IssuePriority, string> = {
  URGENT: "Urgent",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
  NO_PRIORITY: "No Priority",
};

export const KANBAN_COLUMNS: IssueStatus[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
];
