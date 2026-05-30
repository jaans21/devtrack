"use client";

import { useState } from "react";
import { toast } from "sonner";
import { startSprint, completeSprint } from "@/lib/actions/sprints";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import { Play, CheckCircle2, ChevronRight } from "lucide-react";
import type { Sprint } from "@prisma/client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SprintWithMeta = Sprint & {
  _count: { issues: number };
  issues: { storyPoints: number | null; status: string }[];
};

interface SprintCardProps {
  sprint: SprintWithMeta;
  projectKey: string;
  hasActiveSprint?: boolean;
}

export function SprintCard({ sprint, projectKey: _projectKey, hasActiveSprint = false }: SprintCardProps) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  const totalPoints = sprint.issues.reduce((s, i) => s + (i.storyPoints ?? 0), 0);
  const donePoints = sprint.issues
    .filter((i) => i.status === "DONE")
    .reduce((s, i) => s + (i.storyPoints ?? 0), 0);

  const statusColors: Record<string, string> = {
    PLANNED: "bg-slate-500",
    ACTIVE: "bg-green-500",
    COMPLETED: "bg-blue-500",
    CANCELLED: "bg-red-500",
  };

  async function handleStart() {
    const now = new Date();
    const end = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    setLoading(true);
    const result = await startSprint({
      id: sprint.id,
      startDate: now.toISOString(),
      endDate: end.toISOString(),
    });
    if (!result.success) toast.error(result.error);
    else toast.success("Sprint started!");
    setLoading(false);
  }

  async function handleComplete() {
    setLoading(true);
    const result = await completeSprint({ id: sprint.id });
    if (!result.success) toast.error(result.error);
    else toast.success(`Sprint completed! Velocity: ${result.data.velocity} pts`);
    setLoading(false);
  }

  // Build sprint detail link from current path
  const sprintDetailHref = `${pathname.split("/sprints")[0]}/sprints/${sprint.id}`;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`h-2 w-2 rounded-full shrink-0 ${statusColors[sprint.status] ?? "bg-slate-400"}`} />
            <h4 className="font-medium truncate">{sprint.name}</h4>
            {sprint.status === "COMPLETED" && sprint.velocity !== null && (
              <Badge variant="secondary" className="text-xs shrink-0">
                {sprint.velocity} pts
              </Badge>
            )}
          </div>

          {sprint.goal && (
            <p className="text-sm text-muted-foreground truncate">{sprint.goal}</p>
          )}

          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span>{sprint._count.issues} issues</span>
            {totalPoints > 0 && <span>{donePoints}/{totalPoints} pts</span>}
            {sprint.startDate && <span>Started {formatDate(sprint.startDate)}</span>}
            {sprint.endDate && <span>Ends {formatDate(sprint.endDate)}</span>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {sprint.status === "PLANNED" && !hasActiveSprint && (
            <Button size="sm" variant="outline" onClick={handleStart} disabled={loading}>
              <Play className="mr-1 h-3.5 w-3.5" />
              Start
            </Button>
          )}
          {sprint.status === "ACTIVE" && (
            <Button size="sm" variant="outline" onClick={handleComplete} disabled={loading}>
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              Complete
            </Button>
          )}
          {sprint.status !== "PLANNED" && (
            <Link href={sprintDetailHref}>
              <Button size="sm" variant="ghost">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
