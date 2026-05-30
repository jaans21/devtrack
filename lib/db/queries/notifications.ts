import { prisma } from "@/lib/db";

export async function getNotifications(userId: string, workspaceId: string, limit = 30) {
  return prisma.notification.findMany({
    where: { userId, workspaceId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCount(userId: string, workspaceId: string) {
  return prisma.notification.count({
    where: { userId, workspaceId, readAt: null },
  });
}
