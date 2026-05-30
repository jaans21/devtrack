import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

// Lightweight config with NO Prisma — safe for Edge Runtime (middleware).
// Full config with adapter lives in config.ts.
export const authConfigEdge: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
    Credentials({ credentials: {} }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? token.sub ?? "";
        token.needsOnboarding =
          (user as { needsOnboarding?: boolean }).needsOnboarding ?? false;
      }
      if (!token.id && token.sub) token.id = token.sub;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.needsOnboarding = (token.needsOnboarding ?? false) as boolean;
      return session;
    },
  },
};
