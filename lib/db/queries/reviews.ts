import { prisma } from "@/lib/db";

export async function getPendingReviewsForUser(userId: string) {
  return prisma.reviewRequest.findMany({
    where: { reviewerId: userId, status: "PENDING" },
    include: {
      pullRequest: {
        include: {
          repo: true,
          issues: { include: { issue: { select: { id: true, number: true, title: true, project: { select: { key: true } } } } } },
          reviewRequests: { include: { reviewer: { select: { id: true, name: true, image: true } } } },
        },
      },
    },
    orderBy: { pullRequest: { updatedAt: "desc" } },
  });
}

export async function getPRsForProject(projectId: string) {
  return prisma.pullRequest.findMany({
    where: { issues: { some: { issue: { projectId } } } },
    include: {
      repo: true,
      issues: { include: { issue: { select: { id: true, number: true, title: true, project: { select: { key: true } } } } } },
      reviewRequests: { include: { reviewer: { select: { id: true, name: true, image: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });
}
