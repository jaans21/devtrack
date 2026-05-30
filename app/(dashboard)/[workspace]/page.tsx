import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";

interface PageProps {
  params: Promise<{ workspace: string }>;
}

export default async function WorkspacePage({ params }: PageProps) {
  const { workspace: slug } = await params;
  const session = await auth();
  if (!session) redirect("/sign-in");

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: {
      projects: {
        where: { status: "ACTIVE" },
        include: { _count: { select: { issues: true } } },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { members: true } },
    },
  });
  if (!workspace) notFound();

  const recentActivity = await prisma.activityLog.findMany({
    where: { issue: { project: { workspaceId: workspace.id } } },
    include: {
      user: { select: { id: true, name: true, image: true } },
      issue: { select: { id: true, number: true, title: true, project: { select: { key: true, id: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{workspace.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {workspace._count.members} members · {workspace.projects.length} active projects
        </p>
      </div>

      {/* Projects grid */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Projects</h2>
          <Link
            href={`/${slug}/projects/new`}
            className="text-sm text-primary hover:underline"
          >
            + New project
          </Link>
        </div>
        {workspace.projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">No projects yet.</p>
            <Link
              href={`/${slug}/projects/new`}
              className="mt-2 inline-block text-sm text-primary hover:underline"
            >
              Create your first project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspace.projects.map((project) => (
              <Link
                key={project.id}
                href={`/${slug}/projects/${project.id}/board`}
                className="rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-8 w-8 rounded-md flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: project.color }}
                  >
                    {project.key}
                  </span>
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {project._count.issues} issues
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent activity */}
      {recentActivity.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
          <ul className="space-y-3">
            {recentActivity.map((log) => (
              <li key={log.id} className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  {log.user.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <span className="font-medium">{log.user.name}</span>
                  <span className="text-muted-foreground"> {log.action.replace(/_/g, " ")} </span>
                  {log.issue && (
                    <Link
                      href={`/${slug}/projects/${log.issue.project.id}/issues/${log.issue.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {log.issue.project.key}-{log.issue.number}
                    </Link>
                  )}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
