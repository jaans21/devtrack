import { z } from "zod";

export const createSprintSchema = z.object({
  projectId: z.string().cuid(),
  name: z.string().min(1, "Name is required").max(100),
  goal: z.string().max(500).optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
});

export const updateSprintSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100).optional(),
  goal: z.string().max(500).optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
});

export const startSprintSchema = z.object({
  id: z.string().cuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const completeSprintSchema = z.object({
  id: z.string().cuid(),
  moveUnfinishedToSprintId: z.string().cuid().optional().nullable(),
});

export const addIssuesToSprintSchema = z.object({
  sprintId: z.string().cuid(),
  issueIds: z.array(z.string().cuid()).min(1),
});

export type CreateSprintInput = z.infer<typeof createSprintSchema>;
export type UpdateSprintInput = z.infer<typeof updateSprintSchema>;
export type StartSprintInput = z.infer<typeof startSprintSchema>;
export type CompleteSprintInput = z.infer<typeof completeSprintSchema>;
