import { describe, it, expect, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { parseIssueRefs } from "@/lib/github/issue-linker";
import { handlePushEvent, handlePullRequestEvent } from "@/lib/github/webhook-handler";

// The webhook handlers accept the Prisma client as a parameter, so each test
// passes an explicit hand-rolled fake db — no global module mock required.
function makeDb(overrides: Record<string, unknown> = {}) {
  const db = {
    gitHubRepo: { findFirst: vi.fn() },
    commit: { upsert: vi.fn().mockResolvedValue({ id: "commit-1" }) },
    issue: { findFirst: vi.fn(), update: vi.fn().mockResolvedValue({}) },
    commitIssue: { upsert: vi.fn().mockResolvedValue({}) },
    pullRequest: { upsert: vi.fn().mockResolvedValue({ id: "pr-1" }) },
    pullRequestIssue: { upsert: vi.fn().mockResolvedValue({}) },
    ...overrides,
  };
  return db as unknown as PrismaClient & typeof db;
}

const connectedRepo = {
  id: "repo-1",
  repoId: 12345,
  connection: { workspace: { projects: [{ id: "project-1", key: "DEV" }] } },
};

function pushPayload(message: string) {
  return {
    ref: "refs/heads/main",
    repository: { id: 12345, full_name: "org/repo", default_branch: "main" },
    commits: [
      {
        id: "abc123",
        message,
        url: "https://github.com/org/repo/commit/abc123",
        timestamp: new Date().toISOString(),
        author: { name: "Alice", email: "alice@example.com" },
      },
    ],
  };
}

describe("GitHub webhook handler", () => {
  describe("handlePushEvent", () => {
    it("does nothing when repo is not connected", async () => {
      const db = makeDb();
      db.gitHubRepo.findFirst.mockResolvedValueOnce(null);

      await handlePushEvent(pushPayload("Fixes DEV-42"), db);

      expect(db.commit.upsert).not.toHaveBeenCalled();
    });

    it("creates commit record and links to issue", async () => {
      const db = makeDb();
      db.gitHubRepo.findFirst.mockResolvedValueOnce(connectedRepo);
      db.issue.findFirst.mockResolvedValueOnce({ id: "issue-1", number: 42, status: "IN_PROGRESS" });

      await handlePushEvent(pushPayload("DEV-42 add validation"), db);

      expect(db.commit.upsert).toHaveBeenCalledOnce();
      expect(db.commitIssue.upsert).toHaveBeenCalledOnce();
    });

    it("auto-closes issue when commit message says 'Fixes'", async () => {
      const db = makeDb();
      db.gitHubRepo.findFirst.mockResolvedValueOnce(connectedRepo);
      db.issue.findFirst.mockResolvedValueOnce({ id: "issue-1", number: 42 });

      await handlePushEvent(pushPayload("Fixes DEV-42"), db);

      expect(db.issue.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "issue-1" },
          data: expect.objectContaining({ status: "DONE" }),
        })
      );
    });

    it("does not auto-close on a bare reference", async () => {
      const db = makeDb();
      db.gitHubRepo.findFirst.mockResolvedValueOnce(connectedRepo);
      db.issue.findFirst.mockResolvedValueOnce({ id: "issue-1", number: 42 });

      await handlePushEvent(pushPayload("DEV-42 work in progress"), db);

      expect(db.issue.update).not.toHaveBeenCalled();
    });
  });

  describe("handlePullRequestEvent", () => {
    it("links a PR to a referenced issue", async () => {
      const db = makeDb();
      db.gitHubRepo.findFirst.mockResolvedValueOnce(connectedRepo);
      db.issue.findFirst.mockResolvedValueOnce({ id: "issue-1", number: 42 });

      await handlePullRequestEvent(
        {
          action: "opened",
          pull_request: {
            number: 7,
            title: "Implement login",
            body: "Closes DEV-42",
            state: "open",
            draft: false,
            head: { ref: "feature/login" },
            base: { ref: "main" },
            html_url: "https://github.com/org/repo/pull/7",
            merged_at: null,
            closed_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user: { login: "alice" },
          },
          repository: { id: 12345 },
        },
        db
      );

      expect(db.pullRequest.upsert).toHaveBeenCalledOnce();
      expect(db.pullRequestIssue.upsert).toHaveBeenCalledOnce();
    });
  });

  describe("parseIssueRefs (used by the handler)", () => {
    it("distinguishes fixing keywords from bare references", () => {
      const refs = parseIssueRefs("Fixes DEV-42 and references BE-7");
      expect(refs).toHaveLength(2);
      expect(refs[0]?.action).toBe("fixes");
      expect(refs[1]?.action).toBe("references");
    });
  });
});
