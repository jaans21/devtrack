"use server";

import { prisma } from "@/lib/db";
import { createAction } from "./_safe-action";
import { z } from "zod";
import { broadcastToUser } from "@/lib/sse/manager";
import type { NotificationType } from "@prisma/client";

export const markNotificationRead = createAction(
  z.object({ id: z.string().cuid() }),
  async (input, userId) => {
    const notification = await prisma.notification.findFirst({
      where: { id: input.id, userId },
    });
    if (!notification) throw new Error("Notification not found");

    return prisma.notification.update({
      where: { id: input.id },
      data: { readAt: new Date() },
    });
  }
);

export const markAllNotificationsRead = createAction(
  z.object({ workspaceId: z.string().cuid() }),
  async (input, userId) => {
    const result = await prisma.notification.updateMany({
      where: { workspaceId: input.workspaceId, userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { count: result.count };
  }
);

export async function createNotification({
  workspaceId,
  userId,
  type,
  title,
  body,
  url,
  actorId,
  entityId,
  entityType,
}: {
  workspaceId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  url?: string;
  actorId?: string;
  entityId?: string;
  entityType?: string;
}) {
  const notification = await prisma.notification.create({
    data: { workspaceId, userId, type, title, body, url, actorId, entityId, entityType },
  });
  broadcastToUser(userId, { type: "NOTIFICATION", payload: { notificationId: notification.id } });
  return notification;
}
