import { prisma } from "@/lib/db";

export async function getProjectsByWorkspace(workspaceId: string) {
  return prisma.project.findMany({
    where: { workspaceId, status: { not: "ARCHIVED" } },
    include: {
      _count: { select: { issues: true, sprints: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      workspace: { select: { id: true, slug: true, name: true } },
      labels: true,
      milestones: { where: { closedAt: null }, orderBy: { dueDate: "asc" } },
      _count: { select: { issues: true, sprints: true } },
    },
  });
}

export async function getWorkspaceMembers(workspaceId: string) {
  return prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { joinedAt: "asc" },
  });
}
