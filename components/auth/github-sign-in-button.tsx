"use client";

import { signIn } from "next-auth/react";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function GitHubSignInButton({ label = "Continue with GitHub" }: { label?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    await signIn("github", { callbackUrl: "/" });
  }

  return (
    <Button
      variant="outline"
      className="w-full border-slate-600 bg-slate-700 text-white hover:bg-slate-600"
      onClick={handleSignIn}
      disabled={loading}
    >
      <Github className="mr-2 h-4 w-4" />
      {loading ? "Redirecting..." : label}
    </Button>
  );
}
