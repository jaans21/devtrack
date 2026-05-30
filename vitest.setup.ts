import { vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    workspace: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    workspaceMember: { findUnique: vi.fn(), create: vi.fn() },
    project: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    issue: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      aggregate: vi.fn(),
    },
    sprint: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    comment: { create: vi.fn(), findMany: vi.fn() },
    timeEntry: { create: vi.fn(), update: vi.fn(), findMany: vi.fn() },
    notification: { create: vi.fn(), findMany: vi.fn(), updateMany: vi.fn() },
    gitHubConnection: { findFirst: vi.fn() },
    commit: { create: vi.fn(), upsert: vi.fn() },
    pullRequest: { create: vi.fn(), upsert: vi.fn(), update: vi.fn() },
    webhookDelivery: { create: vi.fn() },
    activityLog: { create: vi.fn() },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn({})),
    $disconnect: vi.fn(),
  },
}));

process.env.NEXTAUTH_SECRET = "test-secret";
process.env.GITHUB_WEBHOOK_SECRET = "test-webhook-secret";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
