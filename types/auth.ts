import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      needsOnboarding: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    needsOnboarding?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    needsOnboarding: boolean;
  }
}
