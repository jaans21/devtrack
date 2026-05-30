import NextAuth from "next-auth";
import { authConfigEdge } from "@/lib/auth/config.edge";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfigEdge);

const publicPaths = ["/sign-in", "/sign-up", "/auth/error", "/api/auth"];

export default auth((req: NextRequest & { auth: { user?: { needsOnboarding?: boolean } } | null }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (session?.user?.needsOnboarding && !pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/onboarding/workspace", req.url));
  }

  if (session?.user && !session.user.needsOnboarding && pathname === "/") {
    return NextResponse.redirect(new URL("/workspaces", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
