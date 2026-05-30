import { PRCard } from "./pr-card";
import type { getPRsForProject } from "@/lib/db/queries/reviews";

type PR = Awaited<ReturnType<typeof getPRsForProject>>[number];

interface PRListProps {
  pullRequests: PR[];
}

export function PRList({ pullRequests }: PRListProps) {
  if (pullRequests.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <p className="text-muted-foreground">No pull requests linked to this project yet.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Link PRs by mentioning issue IDs (e.g. FE-42) in commit messages or PR descriptions.
        </p>
      </div>
    );
  }

  const open = pullRequests.filter((p) => p.status === "OPEN" || p.status === "DRAFT");
  const merged = pullRequests.filter((p) => p.status === "MERGED");
  const closed = pullRequests.filter((p) => p.status === "CLOSED");

  return (
    <div className="space-y-6">
      {open.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Open ({open.length})
          </h3>
          <div className="space-y-3">
            {open.map((pr) => <PRCard key={pr.id} pr={pr} />)}
          </div>
        </section>
      )}
      {merged.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Merged ({merged.length})
          </h3>
          <div className="space-y-3">
            {merged.map((pr) => <PRCard key={pr.id} pr={pr} />)}
          </div>
        </section>
      )}
      {closed.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Closed ({closed.length})
          </h3>
          <div className="space-y-3">
            {closed.map((pr) => <PRCard key={pr.id} pr={pr} />)}
          </div>
        </section>
      )}
    </div>
  );
}
