import Link from "next/link";
import type { IssueWithRelations } from "@/lib/db/queries/issues";
import { PRIORITY_COLORS } from "@/lib/utils/colors";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils/format";
import type { IssuePriority } from "@prisma/client";

interface IssueRowProps {
  issue: IssueWithRelations;
  projectKey: string;
  href: string;
}

export function IssueRow({ issue, projectKey, href }: IssueRowProps) {
  const priorityColor = PRIORITY_COLORS[issue.priority as IssuePriority];

  return (
    <Link
      href={href}
      className="flex items-center gap-4 border-b border-border px-6 py-3 hover:bg-muted/30 transition-colors"
    >
      {/* Priority dot */}
      <span className={`h-2 w-2 shrink-0 rounded-full ${priorityColor?.icon ?? ""}`} />

      {/* ID */}
      <span className="w-16 shrink-0 text-xs font-mono text-muted-foreground">
        {projectKey}-{issue.number}
      </span>

      {/* Title */}
      <span className="flex-1 truncate text-sm font-medium">{issue.title}</span>

      {/* Labels */}
      <div className="hidden items-center gap-1 sm:flex">
        {issue.labels.slice(0, 2).map(({ label }) => (
          <span
            key={label.id}
            className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: label.color }}
          >
            {label.name}
          </span>
        ))}
      </div>

      {/* Story points */}
      {issue.storyPoints && (
        <span className="hidden w-8 shrink-0 text-right text-xs text-muted-foreground md:block">
          {issue.storyPoints}p
        </span>
      )}

      {/* Due date */}
      {issue.dueDate && (
        <span className="hidden text-xs text-muted-foreground lg:block">
          {formatDate(issue.dueDate)}
        </span>
      )}

      {/* Assignee */}
      <div className="ml-2 shrink-0">
        {issue.assignee ? (
          <Avatar className="h-6 w-6">
            <AvatarImage src={issue.assignee.image ?? undefined} />
            <AvatarFallback className="text-[10px]">
              {issue.assignee.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-6 w-6 rounded-full border-2 border-dashed border-muted" />
        )}
      </div>
    </Link>
  );
}
