import { vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    workspace: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    workspaceMember: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    project: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    issue: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      aggregate: vi.fn(),
    },
    sprint: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    comment: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn() },
    timeEntry: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), findMany: vi.fn(), delete: vi.fn() },
    notification: { create: vi.fn(), findMany: vi.fn(), updateMany: vi.fn(), update: vi.fn(), findFirst: vi.fn() },
    gitHubConnection: { findFirst: vi.fn() },
    gitHubRepo: { findFirst: vi.fn() },
    commit: { create: vi.fn(), upsert: vi.fn() },
    commitIssue: { upsert: vi.fn() },
    pullRequest: { create: vi.fn(), upsert: vi.fn(), update: vi.fn(), findFirst: vi.fn() },
    pullRequestIssue: { upsert: vi.fn() },
    reviewRequest: { findFirst: vi.fn(), update: vi.fn() },
    webhook: { findFirst: vi.fn() },
    webhookDelivery: { create: vi.fn() },
    activityLog: { create: vi.fn() },
    label: { create: vi.fn() },
    issueLabel: { createMany: vi.fn() },
    $transaction: vi.fn((arg: unknown) =>
      typeof arg === "function" ? (arg as (tx: unknown) => unknown)({}) : Promise.all(arg as unknown[])
    ),
    $disconnect: vi.fn(),
  },
}));

vi.mock("@/lib/sse/manager", () => ({
  broadcastToUser: vi.fn(),
  broadcastToWorkspace: vi.fn(),
  addConnection: vi.fn(),
  removeConnection: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "user-1", needsOnboarding: false } }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: {},
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

process.env.NEXTAUTH_SECRET = "test-secret";
process.env.GITHUB_WEBHOOK_SECRET = "test-webhook-secret";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
