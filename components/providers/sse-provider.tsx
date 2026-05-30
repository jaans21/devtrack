"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import type { SSEEvent } from "@/lib/sse/events";

export function SSEProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!session?.user?.id) return;

    const es = new EventSource("/api/sse");

    es.onmessage = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as SSEEvent;

        switch (data.type) {
          case "ISSUE_UPDATED":
          case "ISSUE_MOVED":
            queryClient.invalidateQueries({ queryKey: ["board"] });
            queryClient.invalidateQueries({ queryKey: ["issues"] });
            break;
          case "SPRINT_STARTED":
            queryClient.invalidateQueries({ queryKey: ["sprints"] });
            break;
          case "NOTIFICATION":
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            break;
        }

        window.dispatchEvent(new CustomEvent("sse", { detail: data }));
      } catch {
        // Ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => es.close();
  }, [session?.user?.id, queryClient]);

  return <>{children}</>;
}
