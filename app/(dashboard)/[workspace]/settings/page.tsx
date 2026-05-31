import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";

interface PageProps {
  params: Promise<{ workspace: string }>;
}

export default async function WorkspaceSettingsPage({ params }: PageProps) {
  const { workspace: slug } = await params;
  const session = await auth();
  if (!session) redirect("/sign-in");

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: { members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } } },
  });
  if (!workspace) notFound();


  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Workspace Settings</h1>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">General</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium">{workspace.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Slug</dt>
            <dd className="font-mono">{workspace.slug}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Members ({workspace.members.length})</h2>
        <ul className="divide-y divide-border">
          {workspace.members.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                {m.user.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{m.user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{m.user.email}</p>
              </div>
              <span className="text-xs text-muted-foreground capitalize">{m.role.toLowerCase()}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Integrations</h2>
        <Link
          href={`/${slug}/settings/integrations`}
          className="text-sm text-primary hover:underline"
        >
          GitHub integration →
        </Link>
      </section>
    </div>
  );
}
