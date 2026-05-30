import type { SSEEvent } from "./events";
import { encodeSSEEvent } from "./events";
import { prisma } from "@/lib/db";

type Controller = ReadableStreamDefaultController<Uint8Array>;

const userConnections = new Map<string, Set<Controller>>();

export function addConnection(userId: string, controller: Controller) {
  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Set());
  }
  userConnections.get(userId)!.add(controller);
}

export function removeConnection(userId: string, controller: Controller) {
  const controllers = userConnections.get(userId);
  if (controllers) {
    controllers.delete(controller);
    if (controllers.size === 0) userConnections.delete(userId);
  }
}

export function broadcastToUser(userId: string, event: SSEEvent) {
  const controllers = userConnections.get(userId);
  if (!controllers?.size) return;

  const encoded = new TextEncoder().encode(encodeSSEEvent(event));
  for (const controller of controllers) {
    try {
      controller.enqueue(encoded);
    } catch {
      controllers.delete(controller);
    }
  }
}

export async function broadcastToWorkspace(workspaceId: string, event: SSEEvent) {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    select: { userId: true },
  });
  for (const { userId } of members) {
    broadcastToUser(userId, event);
  }
}
