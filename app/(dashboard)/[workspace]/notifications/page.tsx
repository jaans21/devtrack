import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getNotifications } from "@/lib/db/queries/notifications";
import { timeAgo } from "@/lib/utils/format";
import Link from "next/link";

interface PageProps {
  params: Promise<{ workspace: string }>;
}

export default async function NotificationsPage({ params }: PageProps) {
  const { workspace: slug } = await params;
  const session = await auth();
  if (!session) redirect("/sign-in");

  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  if (!workspace) notFound();

  const notifications = await getNotifications(session.user.id, workspace.id, 50);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`flex items-start gap-4 px-5 py-4 ${!n.readAt ? "bg-primary/5" : ""}`}
            >
              {!n.readAt && (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
              )}
              {n.readAt && <span className="mt-1.5 h-2 w-2 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
              </div>
              {n.url && (
                <Link href={n.url} className="shrink-0 text-xs text-primary hover:underline">
                  View
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
