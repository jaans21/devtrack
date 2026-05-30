"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { Notification } from "@prisma/client";
import type { SSEEvent } from "@/lib/sse/events";

async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch("/api/notifications");
  if (!res.ok) return [];
  return res.json() as Promise<Notification[]>;
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    function handler(e: Event) {
      const event = (e as CustomEvent<SSEEvent>).detail;
      if (event.type === "NOTIFICATION") {
        void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    }
    window.addEventListener("sse", handler);
    return () => window.removeEventListener("sse", handler);
  }, [queryClient]);

  const notifications = data ?? [];
  const unread = notifications.filter((n) => !n.readAt).length;

  return { notifications, unread, loading: isLoading };
}
