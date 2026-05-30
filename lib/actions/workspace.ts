"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAction } from "./_safe-action";
import { createWorkspaceSchema, updateWorkspaceSchema } from "@/lib/validations/workspace";

export const createWorkspace = createAction(createWorkspaceSchema, async (input, userId) => {
  const existing = await prisma.workspace.findUnique({ where: { slug: input.slug } });
  if (existing) throw new Error("A workspace with this slug already exists");

  const workspace = await prisma.$transaction(async (tx) => {
    const ws = await tx.workspace.create({
      data: { name: input.name, slug: input.slug, ownerId: userId },
    });
    await tx.workspaceMember.create({
      data: { workspaceId: ws.id, userId, role: "OWNER" },
    });
    return ws;
  });

  revalidatePath("/");
  return workspace;
});

export const updateWorkspace = createAction(updateWorkspaceSchema, async (input, userId) => {
  const ws = await prisma.workspace.findFirst({
    where: { id: input.id, ownerId: userId },
  });
  if (!ws) throw new Error("Workspace not found or insufficient permissions");

  const updated = await prisma.workspace.update({
    where: { id: input.id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.slug && { slug: input.slug }),
      ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
    },
  });

  revalidatePath(`/${updated.slug}/settings`);
  return updated;
});

export async function getUserWorkspaces(userId: string) {
  return prisma.workspace.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: { select: { userId: true, role: true } },
      _count: { select: { projects: true, members: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}
