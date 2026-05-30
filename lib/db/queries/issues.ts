import { prisma } from "@/lib/db";
import type { IssueStatus, Prisma } from "@prisma/client";

export type IssueWithRelations = Prisma.IssueGetPayload<{
  include: {
    assignee: { select: { id: true; name: true; image: true } };
    reporter: { select: { id: true; name: true; image: true } };
    labels: { include: { label: true } };
    _count: { select: { comments: true; timeEntries: true; subIssues: true } };
  };
}>;

export async function getIssuesByProject(
  projectId: string,
  filters?: {
    status?: IssueStatus[];
    assigneeId?: string;
    sprintId?: string | null;
    labelIds?: string[];
    search?: string;
  }
): Promise<IssueWithRelations[]> {
  const where: Prisma.IssueWhereInput = { projectId };

  if (filters?.status?.length) where.status = { in: filters.status };
  if (filters?.assigneeId) where.assigneeId = filters.assigneeId;
  if (filters?.sprintId !== undefined) where.sprintId = filters.sprintId;
  if (filters?.labelIds?.length) {
    where.labels = { some: { labelId: { in: filters.labelIds } } };
  }
  if (filters?.search) {
    where.title = { contains: filters.search, mode: Prisma.QueryMode.insensitive };
  }

  return prisma.issue.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      reporter: { select: { id: true, name: true, image: true } },
      labels: { include: { label: true } },
      _count: { select: { comments: true, timeEntries: true, subIssues: true } },
    },
    orderBy: [{ status: "asc" }, { position: "asc" }],
  });
}

export async function getIssueById(id: string) {
  return prisma.issue.findUnique({
    where: { id },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      reporter: { select: { id: true, name: true, image: true } },
      labels: { include: { label: true } },
      comments: {
        include: { author: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
      timeEntries: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { startedAt: "desc" },
      },
      linkedPRs: { include: { pullRequest: true } },
      linkedCommits: { include: { commit: true } },
      subIssues: {
        select: { id: true, number: true, title: true, status: true, priority: true },
      },
      parentIssue: { select: { id: true, number: true, title: true } },
      sprint: { select: { id: true, name: true, status: true } },
      activityLogs: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
}

export async function getIssuesBySprint(sprintId: string) {
  return prisma.issue.findMany({
    where: { sprintId },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      labels: { include: { label: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { position: "asc" },
  });
}

export async function getBoardIssues(projectId: string, sprintId?: string) {
  const issues = await prisma.issue.findMany({
    where: {
      projectId,
      ...(sprintId ? { sprintId } : {}),
      status: { not: "CANCELLED" },
    },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      labels: { include: { label: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { position: "asc" },
  });

  const columns: Record<IssueStatus, typeof issues> = {
    BACKLOG: [],
    TODO: [],
    IN_PROGRESS: [],
    IN_REVIEW: [],
    DONE: [],
    CANCELLED: [],
  };

  for (const issue of issues) {
    columns[issue.status].push(issue);
  }

  return columns;
}
