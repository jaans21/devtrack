import { z } from "zod";

export const createIssueSchema = z.object({
  projectId: z.string().cuid(),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]).optional(),
  priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW", "NO_PRIORITY"]).optional(),
  type: z.enum(["BUG", "FEATURE", "TASK", "IMPROVEMENT", "EPIC"]).optional(),
  assigneeId: z.string().cuid().optional().nullable(),
  sprintId: z.string().cuid().optional().nullable(),
  milestoneId: z.string().cuid().optional().nullable(),
  parentIssueId: z.string().cuid().optional().nullable(),
  storyPoints: z.number().int().min(0).max(100).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  labelIds: z.array(z.string().cuid()).optional(),
});

export const updateIssueSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]).optional(),
  priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW", "NO_PRIORITY"]).optional(),
  type: z.enum(["BUG", "FEATURE", "TASK", "IMPROVEMENT", "EPIC"]).optional(),
  assigneeId: z.string().cuid().optional().nullable(),
  sprintId: z.string().cuid().optional().nullable(),
  milestoneId: z.string().cuid().optional().nullable(),
  parentIssueId: z.string().cuid().optional().nullable(),
  storyPoints: z.number().int().min(0).max(100).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const moveIssueSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]),
  position: z.number(),
});

export const deleteIssueSchema = z.object({
  id: z.string().cuid(),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
export type MoveIssueInput = z.infer<typeof moveIssueSchema>;
