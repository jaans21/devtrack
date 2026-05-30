"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAction } from "./_safe-action";
import {
  createCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
} from "@/lib/validations/comment";
import { broadcastToWorkspace } from "@/lib/sse/manager";

export const createComment = createAction(createCommentSchema, async (input, userId) => {
  const issue = await prisma.issue.findUnique({
    where: { id: input.issueId },
    include: { project: true },
  });
  if (!issue) throw new Error("Issue not found");

  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId: issue.project.workspaceId, userId },
  });
  if (!member) throw new Error("Not a workspace member");

  const comment = await prisma.comment.create({
    data: { issueId: input.issueId, authorId: userId, body: input.body },
    include: { author: { select: { id: true, name: true, image: true } } },
  });

  await prisma.activityLog.create({
    data: { issueId: input.issueId, userId, action: "comment_added" },
  });

  if (issue.assigneeId && issue.assigneeId !== userId) {
    await prisma.notification.create({
      data: {
        workspaceId: issue.project.workspaceId,
        userId: issue.assigneeId,
        type: "COMMENT_ADDED",
        title: `New comment on ${issue.project.key}-${issue.number}`,
        body: input.body.slice(0, 100),
        actorId: userId,
        entityId: issue.id,
        entityType: "Issue",
      },
    });
    broadcastToWorkspace(issue.project.workspaceId, {
      type: "NOTIFICATION",
      payload: { notificationId: comment.id },
    });
  }

  revalidatePath(`/[workspace]/projects/${issue.projectId}/issues/${issue.id}`);
  return comment;
});

export const updateComment = createAction(updateCommentSchema, async (input, userId) => {
  const comment = await prisma.comment.findUnique({ where: { id: input.id } });
  if (!comment) throw new Error("Comment not found");
  if (comment.authorId !== userId) throw new Error("Cannot edit another user's comment");

  const updated = await prisma.comment.update({
    where: { id: input.id },
    data: { body: input.body, editedAt: new Date() },
    include: { author: { select: { id: true, name: true, image: true } } },
  });

  revalidatePath(`/[workspace]/projects`);
  return updated;
});

export const deleteComment = createAction(deleteCommentSchema, async (input, userId) => {
  const comment = await prisma.comment.findUnique({
    where: { id: input.id },
    include: { issue: { include: { project: { select: { workspaceId: true } } } } },
  });
  if (!comment) throw new Error("Comment not found");

  const isAuthor = comment.authorId === userId;
  const adminMember = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: comment.issue.project.workspaceId,
      userId,
      role: { in: ["OWNER", "ADMIN"] },
    },
  });
  if (!isAuthor && !adminMember) throw new Error("Cannot delete this comment");

  await prisma.comment.delete({ where: { id: input.id } });
  revalidatePath(`/[workspace]/projects`);
  return { id: input.id };
});
