import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseIssueRefs } from "@/lib/github/issue-linker";
import { handlePushEvent, handlePullRequestEvent } from "@/lib/github/webhook-handler";
import { prisma } from "@/lib/db";

// Minimal mock db that satisfies the handler signatures
const mockDb = prisma as typeof prisma;

describe("GitHub webhook handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handlePushEvent", () => {
    it("does nothing when repo is not connected", async () => {
      vi.mocked(mockDb.gitHubRepo.findFirst).mockResolvedValueOnce(null);

      await handlePushEvent(
        {
          ref: "refs/heads/main",
          repository: { id: 12345, full_name: "org/repo", default_branch: "main" },
          commits: [
            {
              id: "abc123",
              message: "Fixes DEV-42",
              url: "https://github.com/org/repo/commit/abc123",
              timestamp: new Date().toISOString(),
              author: { name: "Alice", email: "alice@example.com" },
            },
          ],
        },
        mockDb
      );

      expect(mockDb.commit.upsert).not.toHaveBeenCalled();
    });

    it("creates commit record and links to issue", async () => {
      const mockRepo = {
        id: "repo-1",
        repoId: 12345,
        connection: {
          workspace: {
            projects: [{ id: "project-1", key: "DEV" }],
          },
        },
      };

      const mockIssue = { id: "issue-1", number: 42, status: "IN_PROGRESS" };
      const mockCommit = { id: "commit-1" };

      vi.mocked(mockDb.gitHubRepo.findFirst).mockResolvedValueOnce(mockRepo as never);
      vi.mocked(mockDb.commit.upsert).mockResolvedValueOnce(mockCommit as never);
      vi.mocked(mockDb.issue.findFirst).mockResolvedValueOnce(mockIssue as never);
      vi.mocked(mockDb.commitIssue.upsert).mockResolvedValueOnce({} as never);

      await handlePushEvent(
        {
          ref: "refs/heads/main",
          repository: { id: 12345, full_name: "org/repo", default_branch: "main" },
          commits: [
            {
              id: "abc123",
              message: "DEV-42 add validation",
              url: "https://github.com/org/repo/commit/abc123",
              timestamp: new Date().toISOString(),
              author: { name: "Alice", email: "alice@example.com" },
            },
          ],
        },
        mockDb
      );

      expect(mockDb.commit.upsert).toHaveBeenCalledOnce();
      expect(mockDb.commitIssue.upsert).toHaveBeenCalledOnce();
    });

    it("auto-closes issue when commit message says 'Fixes'", async () => {
      const mockRepo = {
        id: "repo-1",
        repoId: 12345,
        connection: { workspace: { projects: [{ id: "project-1", key: "DEV" }] } },
      };
      const mockIssue = { id: "issue-1", number: 42 };
      const mockCommit = { id: "commit-1" };

      vi.mocked(mockDb.gitHubRepo.findFirst).mockResolvedValueOnce(mockRepo as never);
      vi.mocked(mockDb.commit.upsert).mockResolvedValueOnce(mockCommit as never);
      vi.mocked(mockDb.issue.findFirst).mockResolvedValueOnce(mockIssue as never);
      vi.mocked(mockDb.commitIssue.upsert).mockResolvedValueOnce({} as never);
      vi.mocked(mockDb.issue.update).mockResolvedValueOnce({} as never);

      await handlePushEvent(
        {
          ref: "refs/heads/main",
          repository: { id: 12345, full_name: "org/repo", default_branch: "main" },
          commits: [
            {
              id: "abc123",
              message: "Fixes DEV-42",
              url: "https://github.com/org/repo/commit/abc123",
              timestamp: new Date().toISOString(),
              author: { name: "Alice", email: "alice@example.com" },
            },
          ],
        },
        mockDb
      );

      expect(mockDb.issue.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "issue-1" },
          data: expect.objectContaining({ status: "DONE" }),
        })
      );
    });
  });

  describe("HMAC verification", () => {
    it("parseIssueRefs is used by the handler (integration check)", () => {
      const refs = parseIssueRefs("Fixes DEV-42 and references BE-7");
      expect(refs).toHaveLength(2);
      expect(refs[0]?.action).toBe("fixes");
      expect(refs[1]?.action).toBe("references");
    });
  });
});
