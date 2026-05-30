import { z } from "zod";

export const createProjectSchema = z.object({
  workspaceId: z.string().cuid(),
  name: z.string().min(1, "Name is required").max(100),
  key: z
    .string()
    .min(1)
    .max(6)
    .regex(/^[A-Z]+$/, "Key must be uppercase letters only"),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
  repoUrl: z.string().url().optional().nullable(),
});

export const updateProjectSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  color: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
  status: z.enum(["ACTIVE", "ARCHIVED", "COMPLETED"]).optional(),
  repoUrl: z.string().url().optional().nullable(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
