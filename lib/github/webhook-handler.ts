import type { PrismaClient } from "@prisma/client";
import { parseIssueRefs } from "./issue-linker";

type PushPayload = {
  ref: string;
  repository: { id: number; full_name: string; default_branch: string };
  commits: Array<{
    id: string;
    message: string;
    url: string;
    timestamp: string;
    author: { name: string; email: string };
  }>;
};

type PullRequestPayload = {
  action: string;
  pull_request: {
    number: number;
    title: string;
    body: string | null;
    state: string;
    draft: boolean;
    head: { ref: string };
    base: { ref: string };
    html_url: string;
    merged_at: string | null;
    closed_at: string | null;
    created_at: string;
    updated_at: string;
    user: { login: string };
  };
  repository: { id: number };
};

type PullRequestReviewPayload = {
  action: string;
  review: {
    state: string;
    submitted_at: string | null;
    user: { login: string };
  };
  pull_request: { number: number };
  repository: { id: number };
};

export async function handlePushEvent(payload: PushPayload, db: PrismaClient) {
  const repo = await db.gitHubRepo.findFirst({
    where: { repoId: payload.repository.id },
    include: { connection: { include: { workspace: { include: { projects: { select: { id: true, key: true } } } } } } },
  });
  if (!repo) return;

  const projectsByKey = new Map(
    repo.connection.workspace.projects.map((p) => [p.key, p])
  );

  for (const commit of payload.commits) {
    const dbCommit = await db.commit.upsert({
      where: { repoId_sha: { repoId: repo.id, sha: commit.id } },
      create: {
        repoId: repo.id,
        sha: commit.id,
        message: commit.message,
        url: commit.url,
        pushedAt: new Date(commit.timestamp),
        authorName: commit.author.name,
        authorEmail: commit.author.email,
      },
      update: {},
    });

    const refs = parseIssueRefs(commit.message);
    for (const ref of refs) {
      const project = projectsByKey.get(ref.projectKey);
      if (!project) continue;

      const issue = await db.issue.findFirst({
        where: { projectId: project.id, number: ref.issueNumber },
      });
      if (!issue) continue;

      await db.commitIssue.upsert({
        where: { commitId_issueId: { commitId: dbCommit.id, issueId: issue.id } },
        create: { commitId: dbCommit.id, issueId: issue.id },
        update: {},
      });

      if (ref.action === "fixes") {
        await db.issue.update({
          where: { id: issue.id },
          data: { status: "DONE", closedAt: new Date() },
        });
      }
    }
  }
}

export async function handlePullRequestEvent(payload: PullRequestPayload, db: PrismaClient) {
  const repo = await db.gitHubRepo.findFirst({
    where: { repoId: payload.repository.id },
    include: { connection: { include: { workspace: { include: { projects: { select: { id: true, key: true } } } } } } },
  });
  if (!repo) return;

  const pr = payload.pull_request;
  let status: "OPEN" | "CLOSED" | "MERGED" | "DRAFT" = "OPEN";
  if (pr.draft) status = "DRAFT";
  else if (pr.merged_at) status = "MERGED";
  else if (pr.state === "closed") status = "CLOSED";

  const dbPR = await db.pullRequest.upsert({
    where: { repoId_prNumber: { repoId: repo.id, prNumber: pr.number } },
    create: {
      repoId: repo.id,
      prNumber: pr.number,
      title: pr.title,
      body: pr.body,
      status,
      authorLogin: pr.user.login,
      headBranch: pr.head.ref,
      baseBranch: pr.base.ref,
      url: pr.html_url,
      mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
      closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
      createdAt: new Date(pr.created_at),
      updatedAt: new Date(pr.updated_at),
    },
    update: { status, mergedAt: pr.merged_at ? new Date(pr.merged_at) : null, updatedAt: new Date(pr.updated_at) },
  });

  const body = `${pr.title}\n${pr.body ?? ""}`;
  const projectsByKey = new Map(repo.connection.workspace.projects.map((p) => [p.key, p]));
  const refs = parseIssueRefs(body);

  for (const ref of refs) {
    const project = projectsByKey.get(ref.projectKey);
    if (!project) continue;
    const issue = await db.issue.findFirst({ where: { projectId: project.id, number: ref.issueNumber } });
    if (!issue) continue;

    await db.pullRequestIssue.upsert({
      where: { pullRequestId_issueId: { pullRequestId: dbPR.id, issueId: issue.id } },
      create: { pullRequestId: dbPR.id, issueId: issue.id },
      update: {},
    });

    if (ref.action === "fixes" && status === "MERGED") {
      await db.issue.update({ where: { id: issue.id }, data: { status: "DONE", closedAt: new Date() } });
    }
  }
}

export async function handlePullRequestReviewEvent(payload: PullRequestReviewPayload, db: PrismaClient) {
  const repo = await db.gitHubRepo.findFirst({ where: { repoId: payload.repository.id } });
  if (!repo) return;

  const pr = await db.pullRequest.findFirst({
    where: { repoId: repo.id, prNumber: payload.pull_request.number },
  });
  if (!pr) return;

  const reviewerLogin = payload.review.user.login;
  const reviewer = await db.user.findFirst({
    where: { accounts: { some: { providerAccountId: reviewerLogin, provider: "github" } } },
  });
  if (!reviewer) return;

  const stateMap: Record<string, "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED"> = {
    approved: "APPROVED",
    changes_requested: "CHANGES_REQUESTED",
    commented: "COMMENTED",
  };
  const status = stateMap[payload.review.state.toLowerCase()];
  if (!status) return;

  const existing = await db.reviewRequest.findFirst({
    where: { pullRequestId: pr.id, reviewerId: reviewer.id },
  });

  if (existing) {
    await db.reviewRequest.update({
      where: { id: existing.id },
      data: { status, submittedAt: payload.review.submitted_at ? new Date(payload.review.submitted_at) : new Date() },
    });
  }
}

export async function handleGitHubEvent(
  event: string,
  payload: unknown,
  db: PrismaClient
): Promise<void> {
  switch (event) {
    case "push":
      await handlePushEvent(payload as PushPayload, db);
      break;
    case "pull_request":
      await handlePullRequestEvent(payload as PullRequestPayload, db);
      break;
    case "pull_request_review":
      await handlePullRequestReviewEvent(payload as PullRequestReviewPayload, db);
      break;
  }
}
