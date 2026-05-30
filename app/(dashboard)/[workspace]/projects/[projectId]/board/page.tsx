import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBoardIssues } from "@/lib/db/queries/issues";
import { KanbanBoard } from "@/components/board/kanban-board";

interface PageProps {
  params: Promise<{ workspace: string; projectId: string }>;
}

export default async function BoardPage({ params }: PageProps) {
  const { projectId } = await params;
  const session = await auth();
  if (!session) redirect("/sign-in");

  const columns = await getBoardIssues(projectId);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <h2 className="text-sm font-medium text-muted-foreground">Board</h2>
      </div>
      <KanbanBoard initialColumns={columns} projectId={projectId} />
    </div>
  );
}
