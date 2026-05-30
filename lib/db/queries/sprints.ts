import { prisma } from "@/lib/db";

export async function getSprintsByProject(projectId: string) {
  return prisma.sprint.findMany({
    where: { projectId },
    include: {
      _count: { select: { issues: true } },
      issues: { select: { storyPoints: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSprintWithIssues(sprintId: string) {
  return prisma.sprint.findUnique({
    where: { id: sprintId },
    include: {
      issues: {
        include: {
          assignee: { select: { id: true, name: true, image: true } },
          labels: { include: { label: true } },
        },
        orderBy: { position: "asc" },
      },
      burndownSnapshots: { orderBy: { date: "asc" } },
      project: { select: { id: true, key: true, name: true } },
    },
  });
}

export async function getSprintBurndown(sprintId: string) {
  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    include: { burndownSnapshots: { orderBy: { date: "asc" } } },
  });
  if (!sprint) return null;

  return {
    sprint,
    snapshots: sprint.burndownSnapshots,
  };
}

export async function getProjectVelocity(projectId: string, limit = 6) {
  return prisma.sprint.findMany({
    where: { projectId, status: "COMPLETED" },
    select: { id: true, name: true, velocity: true, completedAt: true },
    orderBy: { completedAt: "desc" },
    take: limit,
  });
}
