import { prisma } from "@/lib/db";

export async function getTimeEntriesByIssue(issueId: string) {
  return prisma.timeEntry.findMany({
    where: { issueId },
    include: { user: { select: { id: true, name: true, image: true } } },
    orderBy: { startedAt: "desc" },
  });
}

export async function getRunningTimer(userId: string) {
  return prisma.timeEntry.findFirst({
    where: { userId, stoppedAt: null },
    include: { issue: { select: { id: true, title: true, number: true, project: { select: { key: true } } } } },
  });
}

export async function getTimeReport(
  workspaceId: string,
  opts: { userId?: string; startDate: Date; endDate: Date }
) {
  return prisma.timeEntry.findMany({
    where: {
      issue: { project: { workspaceId } },
      ...(opts.userId ? { userId: opts.userId } : {}),
      startedAt: { gte: opts.startDate, lte: opts.endDate },
      stoppedAt: { not: null },
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      issue: { select: { id: true, title: true, number: true, project: { select: { key: true } } } },
    },
    orderBy: { startedAt: "asc" },
  });
}
