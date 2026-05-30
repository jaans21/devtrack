import { z } from "zod";

export const createCommentSchema = z.object({
  issueId: z.string().cuid(),
  body: z.string().min(1, "Comment cannot be empty").max(10000),
});

export const updateCommentSchema = z.object({
  id: z.string().cuid(),
  body: z.string().min(1).max(10000),
});

export const deleteCommentSchema = z.object({
  id: z.string().cuid(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
