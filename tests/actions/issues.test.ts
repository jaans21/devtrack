import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/db";

// Common mocks (db, auth, sse, next/cache) are provided in vitest.setup.ts.

describe("Issue actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createIssue", () => {
    it("returns error when project does not exist", async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValueOnce(null);

      const { createIssue } = await import("@/lib/actions/issues");

      const result = await createIssue({
        projectId: "ckxprojectnonexist0000000",
        title: "Test issue",
      });

      expect(result.success).toBe(false);
      expect((result as { error: string }).error).toMatch(/not found/i);
    });

    it("returns error when user is not a workspace member", async () => {
      const mockProject = { id: "ckxproject00000000000000", workspaceId: "ckxworkspace000000000000" };

      vi.mocked(prisma.project.findUnique).mockResolvedValueOnce(mockProject as never);
      vi.mocked(prisma.workspaceMember.findFirst).mockResolvedValueOnce(null);

      const { createIssue } = await import("@/lib/actions/issues");

      const result = await createIssue({
        projectId: "ckxproject00000000000000",
        title: "Test issue",
      });

      expect(result.success).toBe(false);
      expect((result as { error: string }).error).toMatch(/member/i);
    });

    it("validates required title field", async () => {
      const { createIssue } = await import("@/lib/actions/issues");

      const result = await createIssue({
        projectId: "ckxproject00000000000000",
        title: "",
      });

      expect(result.success).toBe(false);
      expect((result as { fieldErrors?: Record<string, string[]> }).fieldErrors?.title).toBeTruthy();
    });
  });

  describe("moveIssue", () => {
    it("returns error when issue does not exist", async () => {
      vi.mocked(prisma.issue.findUnique).mockResolvedValueOnce(null);

      const { moveIssue } = await import("@/lib/actions/issues");

      const result = await moveIssue({
        id: "ckxissuenonexist00000000",
        status: "DONE",
        position: 1000,
      });

      expect(result.success).toBe(false);
    });
  });
});
