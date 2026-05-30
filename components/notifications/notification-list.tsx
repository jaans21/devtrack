"use client";

import { NotificationItem } from "./notification-item";
import type { Notification } from "@prisma/client";

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
}

export function NotificationList({ notifications, loading }: NotificationListProps) {
  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        No notifications
      </div>
    );
  }

  return (
    <ul className="max-h-80 overflow-y-auto divide-y divide-border">
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} />
      ))}
    </ul>
  );
}
