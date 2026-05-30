import { z } from "zod";

export const startTimerSchema = z.object({
  issueId: z.string().cuid(),
});

export const stopTimerSchema = z.object({
  entryId: z.string().cuid(),
});

export const logTimeSchema = z.object({
  issueId: z.string().cuid(),
  description: z.string().max(255).optional(),
  duration: z.number().int().positive("Duration must be positive"),
  startedAt: z.string().datetime(),
});

export const deleteTimeEntrySchema = z.object({
  id: z.string().cuid(),
});

export type StartTimerInput = z.infer<typeof startTimerSchema>;
export type LogTimeInput = z.infer<typeof logTimeSchema>;
