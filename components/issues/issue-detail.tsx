"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { IssueStatus, IssuePriority } from "@prisma/client";
import type { getIssueById } from "@/lib/db/queries/issues";
import { updateIssue } from "@/lib/actions/issues";
import { CommentList } from "@/components/comments/comment-list";
import { CommentForm } from "@/components/comments/comment-form";
import { TimerWidget } from "@/components/time-tracking/timer-widget";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/utils/colors";
import { formatDate, timeAgo } from "@/lib/utils/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MarkdownRenderer } from "@/components/editor/markdown-renderer";

type Issue = NonNullable<Awaited<ReturnType<typeof getIssueById>>>;

interface IssueDetailProps {
  issue: Issue;
  projectKey: string;
  workspaceSlug: string;
  currentUserId: string;
  members: { id: string; name: string | null; image: string | null }[];
}

export function IssueDetail({ issue, projectKey, currentUserId, members }: IssueDetailProps) {
  const [status, setStatus] = useState<IssueStatus>(issue.status);
  const [priority, setPriority] = useState<IssuePriority>(issue.priority);
  const [assigneeId, setAssigneeId] = useState<string | null>(issue.assigneeId);

  async function handleUpdate(field: string, value: string | null) {
    const result = await updateIssue({ id: issue.id, [field]: value });
    if (!result.success) toast.error(result.error);
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">{projectKey}-{issue.number}</span>
            <span>·</span>
            <span>{timeAgo(issue.createdAt)}</span>
          </div>
          <h1 className="text-2xl font-bold">{issue.title}</h1>
        </div>

        {/* Description */}
        {issue.description ? (
          <div className="mb-6 rounded-lg border border-border p-4">
            <MarkdownRenderer content={issue.description} />
          </div>
        ) : (
          <p className="mb-6 text-sm text-muted-foreground italic">No description provided.</p>
        )}

        {/* Timer */}
        <div className="mb-6">
          <TimerWidget issueId={issue.id} />
        </div>

        {/* Comments */}
        <div>
          <h3 className="mb-4 text-sm font-semibold">Comments ({issue.comments.length})</h3>
          <CommentList comments={issue.comments} currentUserId={currentUserId} />
          <div className="mt-4">
            <CommentForm issueId={issue.id} />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="w-64 shrink-0 overflow-y-auto border-l border-border p-4 space-y-5">
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
          <Select
            value={status}
            onValueChange={(v: IssueStatus) => {
              setStatus(v);
              void handleUpdate("status", v);
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"] as const).map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</p>
          <Select
            value={priority}
            onValueChange={(v: IssuePriority) => {
              setPriority(v);
              void handleUpdate("priority", v);
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["URGENT", "HIGH", "MEDIUM", "LOW", "NO_PRIORITY"] as const).map((p) => (
                <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Assignee</p>
          <Select
            value={assigneeId ?? "none"}
            onValueChange={(v) => {
              const newAssignee = v === "none" ? null : v;
              setAssigneeId(newAssignee);
              void handleUpdate("assigneeId", newAssignee);
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Unassigned</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name ?? m.id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Reporter</p>
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={issue.reporter.image ?? undefined} />
              <AvatarFallback className="text-[10px]">{issue.reporter.name?.[0]}</AvatarFallback>
            </Avatar>
            <span className="text-xs">{issue.reporter.name}</span>
          </div>
        </div>

        {issue.labels.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Labels</p>
            <div className="flex flex-wrap gap-1">
              {issue.labels.map(({ label }) => (
                <Badge key={label.id} className="text-xs text-white" style={{ backgroundColor: label.color }}>
                  {label.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {issue.dueDate && (
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</p>
            <p className="text-xs">{formatDate(issue.dueDate)}</p>
          </div>
        )}

        {issue.sprint && (
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Sprint</p>
            <p className="text-xs">{issue.sprint.name}</p>
          </div>
        )}

        {/* Linked PRs */}
        {issue.linkedPRs.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Pull Requests</p>
            {issue.linkedPRs.map(({ pullRequest }) => (
              <a
                key={pullRequest.id}
                href={pullRequest.url}
                target="_blank"
                rel="noreferrer"
                className="block text-xs text-primary hover:underline truncate"
              >
                #{pullRequest.prNumber} {pullRequest.title}
              </a>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
