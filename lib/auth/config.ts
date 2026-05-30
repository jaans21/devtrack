import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
    error: "/auth/error",
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github" && user.id) {
        const member = await prisma.workspaceMember.findFirst({
          where: { userId: user.id },
        });
        if (!member) {
          (user as { needsOnboarding?: boolean }).needsOnboarding = true;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? token.sub ?? "";
        token.needsOnboarding = (user as { needsOnboarding?: boolean }).needsOnboarding ?? false;
      }
      if (!token.id && token.sub) {
        token.id = token.sub;
      }
      if (token.id && token.needsOnboarding === undefined) {
        const member = await prisma.workspaceMember.findFirst({
          where: { userId: token.id },
        });
        token.needsOnboarding = !member;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.needsOnboarding = token.needsOnboarding ?? false;
      return session;
    },
  },
};
