"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { IssueStatus } from "@prisma/client";
import type { BoardIssue } from "@/store/board-store";
import { IssueCard } from "./issue-card";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/utils/colors";
import { cn } from "@/lib/utils/cn";

interface KanbanColumnProps {
  status: IssueStatus;
  issues: BoardIssue[];
  projectId: string;
}

export function KanbanColumn({ status, issues, projectId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const colors = STATUS_COLORS[status];

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-muted/30">
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-3">
        <span className={cn("h-2 w-2 rounded-full", colors.dot)} />
        <span className="text-sm font-medium">{STATUS_LABELS[status]}</span>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {issues.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            "flex min-h-[100px] flex-1 flex-col gap-2 rounded-b-xl p-2 transition-colors",
            isOver && "bg-accent/30"
          )}
        >
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
