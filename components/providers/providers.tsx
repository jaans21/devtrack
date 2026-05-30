"use client";

import { QueryProvider } from "./query-provider";
import { SessionProvider } from "./session-provider";
import { ThemeProvider } from "./theme-provider";
import { SSEProvider } from "./sse-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <SessionProvider>
        <QueryProvider>
          <SSEProvider>{children}</SSEProvider>
        </QueryProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
