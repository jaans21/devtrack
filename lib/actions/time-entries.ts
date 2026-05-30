"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAction } from "./_safe-action";
import {
  startTimerSchema,
  stopTimerSchema,
  logTimeSchema,
  deleteTimeEntrySchema,
} from "@/lib/validations/time-entry";

export const startTimer = createAction(startTimerSchema, async (input, userId) => {
  const issue = await prisma.issue.findUnique({ where: { id: input.issueId } });
  if (!issue) throw new Error("Issue not found");

  // Stop any currently running timer for this user
  const running = await prisma.timeEntry.findFirst({
    where: { userId, stoppedAt: null },
  });
  if (running) {
    const now = new Date();
    const duration = Math.floor((now.getTime() - running.startedAt.getTime()) / 1000);
    await prisma.timeEntry.update({
      where: { id: running.id },
      data: { stoppedAt: now, duration },
    });
  }

  const entry = await prisma.timeEntry.create({
    data: { issueId: input.issueId, userId, startedAt: new Date() },
  });

  return entry;
});

export const stopTimer = createAction(stopTimerSchema, async (input, userId) => {
  const entry = await prisma.timeEntry.findUnique({ where: { id: input.entryId } });
  if (!entry) throw new Error("Time entry not found");
  if (entry.userId !== userId) throw new Error("Cannot stop another user's timer");
  if (entry.stoppedAt) throw new Error("Timer is already stopped");

  const now = new Date();
  const duration = Math.floor((now.getTime() - entry.startedAt.getTime()) / 1000);

  const updated = await prisma.timeEntry.update({
    where: { id: input.entryId },
    data: { stoppedAt: now, duration },
  });

  revalidatePath(`/[workspace]/projects`);
  return updated;
});

export const logTime = createAction(logTimeSchema, async (input, userId) => {
  const issue = await prisma.issue.findUnique({ where: { id: input.issueId } });
  if (!issue) throw new Error("Issue not found");

  const entry = await prisma.timeEntry.create({
    data: {
      issueId: input.issueId,
      userId,
      description: input.description,
      startedAt: new Date(input.startedAt),
      stoppedAt: new Date(new Date(input.startedAt).getTime() + input.duration * 1000),
      duration: input.duration,
    },
  });

  revalidatePath(`/[workspace]/projects`);
  return entry;
});

export const deleteTimeEntry = createAction(deleteTimeEntrySchema, async (input, userId) => {
  const entry = await prisma.timeEntry.findUnique({ where: { id: input.id } });
  if (!entry) throw new Error("Time entry not found");
  if (entry.userId !== userId) throw new Error("Cannot delete another user's time entry");

  await prisma.timeEntry.delete({ where: { id: input.id } });
  revalidatePath(`/[workspace]/projects`);
  return { id: input.id };
});
