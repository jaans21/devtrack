import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  slug: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
});

export const updateWorkspaceSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(2).max(50).optional(),
  slug: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  logoUrl: z.string().url().optional().nullable(),
});

export const inviteMemberSchema = z.object({
  workspaceId: z.string().cuid(),
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});

export const updateMemberRoleSchema = z.object({
  workspaceId: z.string().cuid(),
  memberId: z.string().cuid(),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
