import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";
import { GitHubSignInButton } from "@/components/auth/github-sign-in-button";

export const metadata: Metadata = { title: "Sign In" };

export default function SignInPage() {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-8 shadow-2xl backdrop-blur">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-400">Sign in to DevTrack</p>
      </div>

      <GitHubSignInButton />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-600" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-800 px-2 text-slate-400">Or continue with</span>
        </div>
      </div>

      <SignInForm />

      <p className="mt-6 text-center text-sm text-slate-400">
        {"Don't have an account? "}
        <Link href="/sign-up" className="text-blue-400 hover:text-blue-300">
          Sign up
        </Link>
      </p>
    </div>
  );
}
