import { describe, it, expect, vi, beforeEach } from "vitest";

// Self-contained mocks (hoisted) so this file does not depend on global setup.
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    sprint: { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    issue: { updateMany: vi.fn() },
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) =>
      fn({ issue: { updateMany: vi.fn() }, sprint: { update: vi.fn() } })
    ),
  },
}));

vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "user-1", needsOnboarding: false } }),
}));
vi.mock("@/lib/sse/manager", () => ({
  broadcastToWorkspace: vi.fn(),
  broadcastToUser: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { startSprint, completeSprint } from "@/lib/actions/sprints";

const SPRINT_ID_1 = "cksprint00000000000000001";
const SPRINT_ID_2 = "cksprint00000000000000002";
const SPRINT_ID_3 = "cksprint00000000000000003";

describe("Sprint state machine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects starting a sprint that is not PLANNED", async () => {
    mockPrisma.sprint.findUnique.mockResolvedValueOnce({
      id: SPRINT_ID_1,
      status: "COMPLETED",
      projectId: "ckproject0000000000000001",
      project: { workspaceId: "ckworkspace00000000000001" },
    });

    const result = await startSprint({
      id: SPRINT_ID_1,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
    });

    expect(result.success).toBe(false);
    expect((result as { error: string }).error).toMatch(/planned/i);
  });

  it("prevents starting a sprint when one is already active", async () => {
    mockPrisma.sprint.findUnique.mockResolvedValueOnce({
      id: SPRINT_ID_2,
      status: "PLANNED",
      projectId: "ckproject0000000000000001",
      project: { workspaceId: "ckworkspace00000000000001" },
    });
    mockPrisma.sprint.findFirst.mockResolvedValueOnce({ id: SPRINT_ID_1, status: "ACTIVE" });

    const result = await startSprint({
      id: SPRINT_ID_2,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
    });

    expect(result.success).toBe(false);
    expect((result as { error: string }).error).toMatch(/active/i);
  });

  it("rejects completing a sprint that is not ACTIVE", async () => {
    mockPrisma.sprint.findUnique.mockResolvedValueOnce({
      id: SPRINT_ID_3,
      status: "PLANNED",
      projectId: "ckproject0000000000000001",
      issues: [],
      project: { workspaceId: "ckworkspace00000000000001" },
    });

    const result = await completeSprint({ id: SPRINT_ID_3 });

    expect(result.success).toBe(false);
    expect((result as { error: string }).error).toMatch(/active/i);
  });
});
