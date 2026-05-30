import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { WorkspaceSidebar } from "@/components/layout/workspace-sidebar";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  params: Promise<{ workspace: string }>;
}

export default async function WorkspaceLayout({ children, params }: WorkspaceLayoutProps) {
  const { workspace: slug } = await params;
  const session = await auth();
  if (!session) redirect("/sign-in");

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: {
      members: { where: { userId: session.user.id } },
      projects: { where: { status: { not: "ARCHIVED" } }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!workspace || workspace.members.length === 0) notFound();

  return (
    <div className="flex h-full">
      <WorkspaceSidebar workspace={workspace} projects={workspace.projects} />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
