import { Octokit } from "@octokit/rest";
import { prisma } from "@/lib/db";

export async function getOctokitForWorkspace(workspaceId: string): Promise<Octokit | null> {
  const connection = await prisma.gitHubConnection.findFirst({
    where: { workspaceId },
  });
  if (!connection) return null;

  return new Octokit({ auth: connection.accessToken });
}

export function createOctokit(token: string): Octokit {
  return new Octokit({ auth: token });
}
