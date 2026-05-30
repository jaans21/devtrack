import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSprintsByProject } from "@/lib/db/queries/sprints";
import { SprintList } from "@/components/sprints/sprint-list";
import { prisma } from "@/lib/db";

interface PageProps {
  params: Promise<{ workspace: string; projectId: string }>;
}

export default async function SprintsPage({ params }: PageProps) {
  const { projectId } = await params;
  const session = await auth();
  if (!session) redirect("/sign-in");

  const [sprints, project] = await Promise.all([
    getSprintsByProject(projectId),
    prisma.project.findUnique({ where: { id: projectId }, select: { id: true, key: true, name: true } }),
  ]);

  if (!project) redirect("/");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Sprints</h2>
      </div>
      <SprintList sprints={sprints} projectId={projectId} projectKey={project.key} />
    </div>
  );
}
