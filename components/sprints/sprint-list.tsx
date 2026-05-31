"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createSprint } from "@/lib/actions/sprints";
import { SprintCard } from "./sprint-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import type { Sprint } from "@prisma/client";

type SprintWithMeta = Sprint & {
  _count: { issues: number };
  issues: { storyPoints: number | null; status: string }[];
};

interface SprintListProps {
  sprints: SprintWithMeta[];
  projectId: string;
  projectKey: string;
}

export function SprintList({ sprints, projectId, projectKey }: SprintListProps) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    const result = await createSprint({ projectId, name });
    if (!result.success) toast.error(result.error);
    else { setName(""); setCreating(false); }
    setLoading(false);
  }

  const activeSprint = sprints.find((s) => s.status === "ACTIVE");
  const plannedSprints = sprints.filter((s) => s.status === "PLANNED");
  const completedSprints = sprints.filter((s) => s.status === "COMPLETED" || s.status === "CANCELLED");

  return (
    <div className="space-y-6">
      {/* Active sprint */}
      {activeSprint && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Active</h3>
          <SprintCard sprint={activeSprint} projectKey={projectKey} />
        </section>
      )}

      {/* Planned */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Planned</h3>
          <Button size="sm" variant="outline" onClick={() => setCreating(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            New Sprint
          </Button>
        </div>

        {creating && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-border p-3">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sprint name, e.g. Sprint 3"
              className="h-8 flex-1"
              onKeyDown={(e) => { if (e.key === "Enter") void handleCreate(); if (e.key === "Escape") setCreating(false); }}
            />
            <Button size="sm" onClick={handleCreate} disabled={loading}>{loading ? "..." : "Create"}</Button>
            <Button size="sm" variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
          </div>
        )}

        {plannedSprints.length === 0 && !creating && (
          <p className="text-sm text-muted-foreground">No planned sprints.</p>
        )}
        <div className="space-y-3">
          {plannedSprints.map((s) => (
            <SprintCard key={s.id} sprint={s} projectKey={projectKey} hasActiveSprint={!!activeSprint} />
          ))}
        </div>
      </section>

      {/* Completed */}
      {completedSprints.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Completed</h3>
          <div className="space-y-3">
            {completedSprints.map((s) => (
              <SprintCard key={s.id} sprint={s} projectKey={projectKey} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
