import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getSprintWithIssues, getProjectVelocity } from "@/lib/db/queries/sprints";
import { BurndownChart } from "@/components/sprints/burndown-chart";
import { VelocityChart } from "@/components/sprints/velocity-chart";
import { formatDate } from "@/lib/utils/format";

interface PageProps {
  params: Promise<{ workspace: string; projectId: string; sprintId: string }>;
}

export default async function SprintDetailPage({ params }: PageProps) {
  const { projectId, sprintId } = await params;
  const session = await auth();
  if (!session) redirect("/sign-in");

  const [sprint, velocity] = await Promise.all([
    getSprintWithIssues(sprintId),
    getProjectVelocity(projectId),
  ]);
  if (!sprint) notFound();

  const totalPoints = sprint.issues.reduce((s, i) => s + (i.storyPoints ?? 0), 0);
  const donePoints = sprint.issues
    .filter((i) => i.status === "DONE")
    .reduce((s, i) => s + (i.storyPoints ?? 0), 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{sprint.name}</h1>
        {sprint.goal && <p className="mt-1 text-muted-foreground">{sprint.goal}</p>}
        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
          {sprint.startDate && <span>Started {formatDate(sprint.startDate)}</span>}
          {sprint.endDate && <span>Ends {formatDate(sprint.endDate)}</span>}
          <span>{donePoints}/{totalPoints} story points</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold">Burndown</h2>
          <BurndownChart
            snapshots={sprint.burndownSnapshots}
            startDate={sprint.startDate}
            endDate={sprint.endDate}
            totalPoints={totalPoints}
          />
        </div>
        <div>
          <h2 className="mb-4 text-lg font-semibold">Team Velocity</h2>
          <VelocityChart sprints={velocity} />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Issues ({sprint.issues.length})</h2>
        <div className="rounded-lg border border-border divide-y divide-border">
          {sprint.issues.map((issue) => (
            <div key={issue.id} className="flex items-center gap-4 px-4 py-3">
              <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">
                {sprint.project.key}-{issue.number}
              </span>
              <span className="flex-1 truncate text-sm">{issue.title}</span>
              <span className="text-xs text-muted-foreground">{issue.status.replace(/_/g, " ")}</span>
              {issue.storyPoints && (
                <span className="text-xs text-muted-foreground">{issue.storyPoints}p</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
