import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/db";

// Tests for sprint state machine logic embedded in lib/actions/sprints.ts

describe("Sprint state machine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("only allows PLANNED → ACTIVE transition via startSprint", async () => {
    const mockSprint = {
      id: "sprint-1",
      status: "COMPLETED",
      projectId: "project-1",
      project: { workspaceId: "ws-1" },
    };

    vi.mocked(prisma.sprint.findUnique).mockResolvedValueOnce(mockSprint as never);

    const { startSprint } = await import("@/lib/actions/sprints");

    // Mock auth
    vi.doMock("@/lib/auth", () => ({
      auth: vi.fn().mockResolvedValue({ user: { id: "user-1" } }),
    }));

    const result = await startSprint({
      id: "sprint-1",
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
    });

    expect(result.success).toBe(false);
    expect(result).toMatchObject({ success: false, error: expect.stringContaining("planned") });
  });

  it("prevents starting a sprint when one is already active", async () => {
    const mockSprint = {
      id: "sprint-2",
      status: "PLANNED",
      projectId: "project-1",
      project: { workspaceId: "ws-1" },
    };

    const activeSprint = { id: "sprint-1", status: "ACTIVE" };

    vi.mocked(prisma.sprint.findUnique).mockResolvedValueOnce(mockSprint as never);
    vi.mocked(prisma.sprint.findFirst).mockResolvedValueOnce(activeSprint as never);

    const { startSprint } = await import("@/lib/actions/sprints");

    const result = await startSprint({
      id: "sprint-2",
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
    });

    expect(result.success).toBe(false);
    expect((result as { error: string }).error).toMatch(/active/i);
  });

  it("only allows ACTIVE → COMPLETED transition via completeSprint", async () => {
    const mockSprint = {
      id: "sprint-3",
      status: "PLANNED",
      projectId: "project-1",
      issues: [],
      project: { workspaceId: "ws-1" },
    };

    vi.mocked(prisma.sprint.findUnique).mockResolvedValueOnce(mockSprint as never);

    const { completeSprint } = await import("@/lib/actions/sprints");

    const result = await completeSprint({ id: "sprint-3" });

    expect(result.success).toBe(false);
    expect((result as { error: string }).error).toMatch(/active/i);
  });
});
