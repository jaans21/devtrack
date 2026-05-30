import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/lib/actions/workspace";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function WorkspacesPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const workspaces = await getUserWorkspaces(session.user.id);

  if (workspaces.length === 1 && workspaces[0]) {
    redirect(`/${workspaces[0].slug}`);
  }

  if (workspaces.length === 0) {
    redirect("/onboarding/workspace");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-sm p-4">
        <h1 className="mb-6 text-xl font-semibold text-white">Choose a workspace</h1>
        <ul className="space-y-2">
          {workspaces.map((ws) => (
            <li key={ws.id}>
              <Link
                href={`/${ws.slug}`}
                className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 p-4 hover:bg-slate-700"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                  {ws.name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-white">{ws.name}</p>
                  <p className="text-xs text-slate-400">{ws._count.members} members</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/onboarding/workspace"
          className="mt-4 block rounded-lg border border-dashed border-slate-600 p-4 text-center text-sm text-slate-400 hover:border-slate-500"
        >
          + Create a new workspace
        </Link>
      </div>
    </div>
  );
}
