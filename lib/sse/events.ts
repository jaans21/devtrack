import type { IssueStatus } from "@prisma/client";

export type SSEEvent =
  | { type: "ISSUE_UPDATED"; payload: { issueId: string; changes: Record<string, unknown> } }
  | { type: "ISSUE_MOVED"; payload: { issueId: string; fromStatus: IssueStatus; toStatus: IssueStatus } }
  | { type: "SPRINT_STARTED"; payload: { sprintId: string } }
  | { type: "NOTIFICATION"; payload: { notificationId: string } }
  | { type: "HEARTBEAT" };

export function encodeSSEEvent(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}
