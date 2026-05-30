"use client";

import { markNotificationRead } from "@/lib/actions/notifications";
import { timeAgo } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Notification } from "@prisma/client";
import Link from "next/link";

export function NotificationItem({ notification }: { notification: Notification }) {
  const isUnread = !notification.readAt;

  async function handleClick() {
    if (isUnread) {
      await markNotificationRead({ id: notification.id });
    }
  }

  const content = (
    <li
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50 cursor-pointer",
        isUnread && "bg-primary/5"
      )}
    >
      {isUnread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
      {!isUnread && <span className="mt-1.5 h-2 w-2 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">{notification.title}</p>
        {notification.body && (
          <p className="mt-0.5 text-xs text-muted-foreground truncate">{notification.body}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{timeAgo(notification.createdAt)}</p>
      </div>
    </li>
  );

  if (notification.url) {
    return <Link href={notification.url}>{content}</Link>;
  }

  return content;
}
