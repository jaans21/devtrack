import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getIssueById } from "@/lib/db/queries/issues";
import { IssueDetail } from "@/components/issues/issue-detail";
import { prisma } from "@/lib/db";

interface PageProps {
  params: Promise<{ workspace: string; projectId: string; issueId: string }>;
}

export default async function IssueDetailPage({ params }: PageProps) {
  const { workspace: slug, projectId, issueId } = await params;
  const session = await auth();
  if (!session) redirect("/sign-in");

  const [issue, project] = await Promise.all([
    getIssueById(issueId),
    prisma.project.findUnique({
      where: { id: projectId },
      include: { workspace: { select: { id: true, slug: true } } },
    }),
  ]);

  if (!issue || !project) notFound();

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: project.workspace.id },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  return (
    <IssueDetail
      issue={issue}
      projectKey={project.key}
      workspaceSlug={slug}
      currentUserId={session.user.id}
      members={members.map((m) => m.user)}
    />
  );
}
