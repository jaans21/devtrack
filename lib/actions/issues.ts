"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAction } from "./_safe-action";
import {
  createIssueSchema,
  updateIssueSchema,
  moveIssueSchema,
  deleteIssueSchema,
} from "@/lib/validations/issue";
import { getNextIssueNumber } from "@/lib/utils/issue-number";
import { broadcastToWorkspace } from "@/lib/sse/manager";

export const createIssue = createAction(createIssueSchema, async (input, userId) => {
  const project = await prisma.project.findUnique({ where: { id: input.projectId } });
  if (!project) throw new Error("Project not found");

  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId: project.workspaceId, userId },
  });
  if (!member) throw new Error("Not a workspace member");

  const number = await getNextIssueNumber(input.projectId);

  const lastIssue = await prisma.issue.findFirst({
    where: { projectId: input.projectId, status: input.status ?? "BACKLOG" },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (lastIssue?.position ?? 0) + 1000;

  const issue = await prisma.issue.create({
    data: {
      number,
      projectId: input.projectId,
      title: input.title,
      description: input.description,
      status: input.status ?? "BACKLOG",
      priority: input.priority ?? "NO_PRIORITY",
      type: input.type ?? "TASK",
      assigneeId: input.assigneeId,
      sprintId: input.sprintId,
      milestoneId: input.milestoneId,
      parentIssueId: input.parentIssueId,
      storyPoints: input.storyPoints,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      reporterId: userId,
      position,
    },
    include: { assignee: { select: { id: true, name: true, image: true } }, labels: { include: { label: true } } },
  });

  if (input.labelIds?.length) {
    await prisma.issueLabel.createMany({
      data: input.labelIds.map((labelId) => ({ issueId: issue.id, labelId })),
    });
  }

  if (input.assigneeId && input.assigneeId !== userId) {
    const assigneeId = input.assigneeId;
    const ws = await prisma.workspace.findUnique({ where: { id: project.workspaceId } });
    await prisma.notification.create({
      data: {
        workspaceId: project.workspaceId,
        userId: assigneeId,
        type: "ISSUE_ASSIGNED",
        title: `You were assigned to ${project.key}-${number}`,
        body: input.title,
        url: `/${ws?.slug ?? ""}/projects/${project.id}/issues/${issue.id}`,
        actorId: userId,
        entityId: issue.id,
        entityType: "Issue",
      },
    });
    broadcastToWorkspace(project.workspaceId, { type: "NOTIFICATION", payload: { notificationId: issue.id } });
  }

  await prisma.activityLog.create({
    data: { issueId: issue.id, userId, action: "created" },
  });

  revalidatePath(`/[workspace]/projects/${input.projectId}/issues`);
  return issue;
});

export const updateIssue = createAction(updateIssueSchema, async (input, userId) => {
  const issue = await prisma.issue.findUnique({
    where: { id: input.id },
    include: { project: true },
  });
  if (!issue) throw new Error("Issue not found");

  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId: issue.project.workspaceId, userId },
  });
  if (!member) throw new Error("Not a workspace member");

  const previousStatus = issue.status;

  const updated = await prisma.issue.update({
    where: { id: input.id },
    data: {
      ...(input.title && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.status && { status: input.status }),
      ...(input.priority && { priority: input.priority }),
      ...(input.type && { type: input.type }),
      ...(input.assigneeId !== undefined && { assigneeId: input.assigneeId }),
      ...(input.sprintId !== undefined && { sprintId: input.sprintId }),
      ...(input.milestoneId !== undefined && { milestoneId: input.milestoneId }),
      ...(input.storyPoints !== undefined && { storyPoints: input.storyPoints }),
      ...(input.dueDate !== undefined && { dueDate: input.dueDate ? new Date(input.dueDate) : null }),
      ...(input.status === "DONE" || input.status === "CANCELLED"
        ? { closedAt: new Date() }
        : previousStatus === "DONE" || previousStatus === "CANCELLED"
        ? { closedAt: null }
        : {}),
    },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      labels: { include: { label: true } },
    },
  });

  if (input.status && input.status !== previousStatus) {
    await prisma.activityLog.create({
      data: {
        issueId: input.id,
        userId,
        action: "status_changed",
        metadata: { from: previousStatus, to: input.status },
      },
    });
    broadcastToWorkspace(issue.project.workspaceId, {
      type: "ISSUE_MOVED",
      payload: { issueId: input.id, fromStatus: previousStatus, toStatus: input.status },
    });
  } else {
    broadcastToWorkspace(issue.project.workspaceId, {
      type: "ISSUE_UPDATED",
      payload: { issueId: input.id, changes: {} },
    });
  }

  revalidatePath(`/[workspace]/projects/${issue.projectId}/issues`);
  return updated;
});

export const moveIssue = createAction(moveIssueSchema, async (input, userId) => {
  const issue = await prisma.issue.findUnique({
    where: { id: input.id },
    include: { project: true },
  });
  if (!issue) throw new Error("Issue not found");

  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId: issue.project.workspaceId, userId },
  });
  if (!member) throw new Error("Not a workspace member");

  const previousStatus = issue.status;
  const updated = await prisma.issue.update({
    where: { id: input.id },
    data: {
      status: input.status,
      position: input.position,
      ...(input.status === "DONE" ? { closedAt: new Date() } : {}),
      ...(previousStatus === "DONE" && input.status !== "DONE" ? { closedAt: null } : {}),
    },
  });

  if (input.status !== previousStatus) {
    await prisma.activityLog.create({
      data: {
        issueId: input.id,
        userId,
        action: "status_changed",
        metadata: { from: previousStatus, to: input.status },
      },
    });
  }

  broadcastToWorkspace(issue.project.workspaceId, {
    type: "ISSUE_MOVED",
    payload: { issueId: input.id, fromStatus: previousStatus, toStatus: input.status },
  });

  return updated;
});

export const deleteIssue = createAction(deleteIssueSchema, async (input, userId) => {
  const issue = await prisma.issue.findUnique({
    where: { id: input.id },
    include: { project: true },
  });
  if (!issue) throw new Error("Issue not found");

  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId: issue.project.workspaceId, userId, role: { in: ["OWNER", "ADMIN"] } },
  });
  if (!member) throw new Error("Insufficient permissions to delete issues");

  await prisma.issue.delete({ where: { id: input.id } });
  revalidatePath(`/[workspace]/projects/${issue.projectId}/issues`);
  return { id: input.id };
});
