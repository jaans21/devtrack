import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getIssuesByProject } from "@/lib/db/queries/issues";
import { getWorkspaceMembers } from "@/lib/db/queries/projects";
import { prisma } from "@/lib/db";
import { IssueList } from "@/components/issues/issue-list";
import { CreateIssueDialog } from "@/components/issues/create-issue-dialog";

interface PageProps {
  params: Promise<{ workspace: string; projectId: string }>;
}

export default async function IssuesPage({ params }: PageProps) {
  const { projectId } = await params;
  const session = await auth();
  if (!session) redirect("/sign-in");

  const [issues, project] = await Promise.all([
    getIssuesByProject(projectId),
    prisma.project.findUnique({
      where: { id: projectId },
      include: { workspace: { select: { id: true, slug: true } }, labels: true },
    }),
  ]);

  if (!project) redirect("/");

  const members = await getWorkspaceMembers(project.workspace.id);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <h2 className="text-sm font-medium text-muted-foreground">Issues ({issues.length})</h2>
        <CreateIssueDialog
          projectId={projectId}
          projectKey={project.key}
          members={members.map((m) => ({ id: m.user.id, name: m.user.name, image: m.user.image }))}
          labels={project.labels}
        />
      </div>
      <IssueList
        issues={issues}
        projectKey={project.key}
        workspaceSlug={project.workspace.slug}
        projectId={projectId}
      />
    </div>
  );
}
