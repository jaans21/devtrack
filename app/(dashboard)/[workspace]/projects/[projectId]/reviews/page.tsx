import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPRsForProject } from "@/lib/db/queries/reviews";
import { PRList } from "@/components/reviews/pr-list";

interface PageProps {
  params: Promise<{ workspace: string; projectId: string }>;
}

export default async function ReviewsPage({ params }: PageProps) {
  const { projectId } = await params;
  const session = await auth();
  if (!session) redirect("/sign-in");

  const pullRequests = await getPRsForProject(projectId);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Code Reviews</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pull requests linked to issues in this project
        </p>
      </div>
      <PRList pullRequests={pullRequests} />
    </div>
  );
}
