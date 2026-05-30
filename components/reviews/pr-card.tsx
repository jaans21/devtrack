import type { getPRsForProject } from "@/lib/db/queries/reviews";
import { ReviewStatusBadge } from "./review-status-badge";
import { timeAgo } from "@/lib/utils/format";
import { GitPullRequest, GitMerge, GitPullRequestClosed } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type PR = Awaited<ReturnType<typeof getPRsForProject>>[number];

const STATUS_ICONS = {
  OPEN: <GitPullRequest className="h-4 w-4 text-green-500" />,
  DRAFT: <GitPullRequest className="h-4 w-4 text-slate-400" />,
  MERGED: <GitMerge className="h-4 w-4 text-purple-500" />,
  CLOSED: <GitPullRequestClosed className="h-4 w-4 text-red-500" />,
};

interface PRCardProps {
  pr: PR;
}

export function PRCard({ pr }: PRCardProps) {
  const isStale =
    pr.status === "OPEN" &&
    new Date(pr.updatedAt).getTime() < Date.now() - 3 * 24 * 60 * 60 * 1000;

  return (
    <div className={`rounded-lg border bg-card p-4 ${isStale ? "border-yellow-500/50" : "border-border"}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{STATUS_ICONS[pr.status]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <a
              href={pr.url}
              target="_blank"
              rel="noreferrer"
              className="font-medium hover:text-primary hover:underline truncate"
            >
              {pr.title}
            </a>
            {isStale && (
              <span className="shrink-0 text-xs font-medium text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded">
                Stale
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>#{pr.prNumber}</span>
            <span>by {pr.authorLogin}</span>
            <span>{timeAgo(pr.updatedAt)}</span>
            <span className="font-mono">{pr.headBranch} → {pr.baseBranch}</span>
          </div>

          {/* Linked issues */}
          {pr.issues.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {pr.issues.map(({ issue }) => (
                <span key={issue.id} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                  {issue.project.key}-{issue.number}
                </span>
              ))}
            </div>
          )}

          {/* Reviewers */}
          {pr.reviewRequests.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              {pr.reviewRequests.map((rr) => (
                <div key={rr.id} className="flex items-center gap-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={rr.reviewer.image ?? undefined} />
                    <AvatarFallback className="text-[10px]">{rr.reviewer.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <ReviewStatusBadge status={rr.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
