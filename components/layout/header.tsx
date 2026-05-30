import { auth } from "@/lib/auth";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "@/components/notifications/notification-bell";

export async function Header() {
  const session = await auth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-2">
        {/* Breadcrumb / workspace name populated by child layouts */}
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
        {session?.user && (
          <UserMenu
            user={{
              name: session.user.name ?? null,
              email: session.user.email ?? null,
              image: session.user.image ?? null,
            }}
          />
        )}
      </div>
    </header>
  );
}
