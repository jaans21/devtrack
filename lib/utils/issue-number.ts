import { prisma } from "@/lib/db";

export async function getNextIssueNumber(projectId: string): Promise<number> {
  const last = await prisma.issue.findFirst({
    where: { projectId },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  return (last?.number ?? 0) + 1;
}

export function formatIssueId(key: string, number: number): string {
  return `${key}-${number}`;
}

export function getMidpointPosition(a: number | undefined, b: number | undefined): number {
  if (a === undefined && b === undefined) return 1000;
  if (a === undefined) return (b ?? 1000) - 1000;
  if (b === undefined) return a + 1000;
  const mid = (a + b) / 2;
  if (Math.abs(b - a) < 0.001) return a + 1000;
  return mid;
}
