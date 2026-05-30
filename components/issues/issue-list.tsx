"use client";

import type { IssueWithRelations } from "@/lib/db/queries/issues";
import { IssueRow } from "./issue-row";
import { STATUS_LABELS, KANBAN_COLUMNS } from "@/lib/utils/colors";
import type { IssueStatus } from "@prisma/client";

interface IssueListProps {
  issues: IssueWithRelations[];
  projectKey: string;
  workspaceSlug: string;
  projectId: string;
}

export function IssueList({ issues, projectKey, workspaceSlug, projectId }: IssueListProps) {
  const grouped = KANBAN_COLUMNS.reduce<Record<IssueStatus, IssueWithRelations[]>>(
    (acc, status) => {
      acc[status] = issues.filter((i) => i.status === status);
      return acc;
    },
    {} as Record<IssueStatus, IssueWithRelations[]>
  );

  return (
    <div className="flex-1 overflow-y-auto">
      {KANBAN_COLUMNS.map((status) => {
        const statusIssues = grouped[status];
        if (!statusIssues || statusIssues.length === 0) return null;
        return (
          <div key={status}>
            <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/95 px-6 py-2 backdrop-blur">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {STATUS_LABELS[status]}
              </span>
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {statusIssues.length}
              </span>
            </div>
            {statusIssues.map((issue) => (
              <IssueRow
                key={issue.id}
                issue={issue}
                projectKey={projectKey}
                href={`/${workspaceSlug}/projects/${projectId}/issues/${issue.id}`}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
