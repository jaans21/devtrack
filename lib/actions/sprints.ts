"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAction } from "./_safe-action";
import {
  createSprintSchema,
  updateSprintSchema,
  startSprintSchema,
  completeSprintSchema,
  addIssuesToSprintSchema,
} from "@/lib/validations/sprint";
import { z } from "zod";
import { broadcastToWorkspace } from "@/lib/sse/manager";

export const createSprint = createAction(createSprintSchema, async (input, userId) => {
  const project = await prisma.project.findUnique({ where: { id: input.projectId } });
  if (!project) throw new Error("Project not found");

  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId: project.workspaceId, userId, role: { in: ["OWNER", "ADMIN", "MEMBER"] } },
  });
  if (!member) throw new Error("Insufficient permissions");

  return prisma.sprint.create({
    data: {
      projectId: input.projectId,
      name: input.name,
      goal: input.goal,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
    },
  });
});

export const updateSprint = createAction(updateSprintSchema, async (input, _userId) => {
  const sprint = await prisma.sprint.findUnique({ where: { id: input.id } });
  if (!sprint) throw new Error("Sprint not found");
  if (sprint.status === "COMPLETED" || sprint.status === "CANCELLED")
    throw new Error("Cannot update a completed or cancelled sprint");

  return prisma.sprint.update({
    where: { id: input.id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.goal !== undefined && { goal: input.goal }),
      ...(input.startDate !== undefined && { startDate: input.startDate ? new Date(input.startDate) : null }),
      ...(input.endDate !== undefined && { endDate: input.endDate ? new Date(input.endDate) : null }),
    },
  });
});

export const startSprint = createAction(startSprintSchema, async (input, _userId) => {
  const sprint = await prisma.sprint.findUnique({
    where: { id: input.id },
    include: { project: true },
  });
  if (!sprint) throw new Error("Sprint not found");
  if (sprint.status !== "PLANNED") throw new Error("Only planned sprints can be started");

  const activeSprint = await prisma.sprint.findFirst({
    where: { projectId: sprint.projectId, status: "ACTIVE" },
  });
  if (activeSprint) throw new Error("A sprint is already active in this project");

  const updated = await prisma.sprint.update({
    where: { id: input.id },
    data: { status: "ACTIVE", startDate: new Date(input.startDate), endDate: new Date(input.endDate) },
  });

  broadcastToWorkspace(sprint.project.workspaceId, {
    type: "SPRINT_STARTED",
    payload: { sprintId: sprint.id },
  });

  revalidatePath(`/[workspace]/projects/${sprint.projectId}/sprints`);
  return updated;
});

export const completeSprint = createAction(completeSprintSchema, async (input, _userId) => {
  const sprint = await prisma.sprint.findUnique({
    where: { id: input.id },
    include: { issues: true, project: true },
  });
  if (!sprint) throw new Error("Sprint not found");
  if (sprint.status !== "ACTIVE") throw new Error("Only active sprints can be completed");

  const completedPoints = sprint.issues
    .filter((i) => i.status === "DONE")
    .reduce((sum, i) => sum + (i.storyPoints ?? 0), 0);

  await prisma.$transaction(async (tx) => {
    const unfinished = sprint.issues.filter(
      (i) => i.status !== "DONE" && i.status !== "CANCELLED"
    );

    if (unfinished.length > 0) {
      await tx.issue.updateMany({
        where: { id: { in: unfinished.map((i) => i.id) } },
        data: {
          sprintId: input.moveUnfinishedToSprintId ?? null,
          status: input.moveUnfinishedToSprintId ? undefined : "BACKLOG",
        },
      });
    }

    await tx.sprint.update({
      where: { id: input.id },
      data: { status: "COMPLETED", completedAt: new Date(), velocity: completedPoints },
    });
  });

  if (sprint.project) {
    broadcastToWorkspace(sprint.project.workspaceId, {
      type: "SPRINT_STARTED",
      payload: { sprintId: sprint.id },
    });
  }

  revalidatePath(`/[workspace]/projects/${sprint.projectId}/sprints`);
  return { id: sprint.id, velocity: completedPoints };
});

export const addIssuesToSprint = createAction(addIssuesToSprintSchema, async (input, _userId) => {
  await prisma.issue.updateMany({
    where: { id: { in: input.issueIds } },
    data: { sprintId: input.sprintId },
  });
  revalidatePath(`/[workspace]/projects`);
  return { count: input.issueIds.length };
});

export const removeIssueFromSprint = createAction(
  z.object({ issueId: z.string().cuid() }),
  async (input, _userId) => {
    await prisma.issue.update({
      where: { id: input.issueId },
      data: { sprintId: null },
    });
    return { id: input.issueId };
  }
);
