"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAction } from "./_safe-action";
import { createProjectSchema, updateProjectSchema } from "@/lib/validations/project";
import { z } from "zod";

export const createProject = createAction(createProjectSchema, async (input, userId) => {
  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId: input.workspaceId, userId, role: { in: ["OWNER", "ADMIN"] } },
  });
  if (!member) throw new Error("Insufficient permissions to create a project");

  const existing = await prisma.project.findFirst({
    where: { workspaceId: input.workspaceId, key: input.key },
  });
  if (existing) throw new Error(`Project key "${input.key}" is already in use`);

  const project = await prisma.project.create({
    data: {
      workspaceId: input.workspaceId,
      name: input.name,
      key: input.key.toUpperCase(),
      description: input.description,
      color: input.color ?? "#6366f1",
      repoUrl: input.repoUrl,
    },
  });

  revalidatePath(`/[workspace]/projects`, "page");
  return project;
});

export const updateProject = createAction(updateProjectSchema, async (input, userId) => {
  const project = await prisma.project.findUnique({
    where: { id: input.id },
    include: { workspace: true },
  });
  if (!project) throw new Error("Project not found");

  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: project.workspaceId,
      userId,
      role: { in: ["OWNER", "ADMIN"] },
    },
  });
  if (!member) throw new Error("Insufficient permissions");

  const updated = await prisma.project.update({
    where: { id: input.id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.color && { color: input.color }),
      ...(input.status && { status: input.status }),
      ...(input.repoUrl !== undefined && { repoUrl: input.repoUrl }),
    },
  });

  revalidatePath(`/[workspace]/projects/${input.id}`);
  return updated;
});

export const archiveProject = createAction(
  z.object({ id: z.string().cuid() }),
  async (input, userId) => {
    const project = await prisma.project.findUnique({ where: { id: input.id } });
    if (!project) throw new Error("Project not found");

    const member = await prisma.workspaceMember.findFirst({
      where: { workspaceId: project.workspaceId, userId, role: { in: ["OWNER", "ADMIN"] } },
    });
    if (!member) throw new Error("Insufficient permissions");

    return prisma.project.update({
      where: { id: input.id },
      data: { status: "ARCHIVED" },
    });
  }
);
