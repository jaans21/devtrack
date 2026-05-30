"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BoardIssue } from "@/store/board-store";
import { cn } from "@/lib/utils/cn";
import { PRIORITY_COLORS } from "@/lib/utils/colors";
import { MessageSquare, AlertCircle, ArrowUp, Minus, ArrowDown, ChevronsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { IssuePriority } from "@prisma/client";

const PRIORITY_ICONS: Record<IssuePriority, React.ReactNode> = {
  URGENT: <ChevronsUp className="h-3.5 w-3.5" />,
  HIGH: <ArrowUp className="h-3.5 w-3.5" />,
  MEDIUM: <Minus className="h-3.5 w-3.5" />,
  LOW: <ArrowDown className="h-3.5 w-3.5" />,
  NO_PRIORITY: <AlertCircle className="h-3.5 w-3.5" />,
};

interface IssueCardProps {
  issue: BoardIssue;
  isDragging?: boolean;
}

export function IssueCard({ issue, isDragging = false }: IssueCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } =
    useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "rounded-lg border border-border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing select-none",
        (isSortableDragging || isDragging) && "opacity-40 ring-2 ring-primary"
      )}
    >
      {/* Labels */}
      {issue.labels && issue.labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {issue.labels.slice(0, 3).map(({ label }) => (
            <span
              key={label.name}
              className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm font-medium leading-snug line-clamp-2">{issue.title}</p>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between">
        <div className={cn("flex items-center gap-1", PRIORITY_COLORS[issue.priority as IssuePriority]?.icon)}>
          {PRIORITY_ICONS[issue.priority as IssuePriority]}
        </div>

        <div className="flex items-center gap-2">
          {issue._count && issue._count.comments > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              {issue._count.comments}
            </span>
          )}
          {issue.assignee && (
            <Avatar className="h-5 w-5">
              <AvatarImage src={issue.assignee.image ?? undefined} />
              <AvatarFallback className="text-[10px]">
                {issue.assignee.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
}
