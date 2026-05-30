import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProjectNav } from "@/components/projects/project-nav";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ workspace: string; projectId: string }>;
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { workspace: slug, projectId } = await params;
  const session = await auth();
  if (!session) redirect("/sign-in");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { workspace: { select: { slug: true, id: true } } },
  });

  if (!project || project.workspace.slug !== slug) notFound();

  return (
    <div className="flex h-full flex-col">
      <ProjectNav project={project} workspaceSlug={slug} />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
