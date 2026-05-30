import Link from "next/link";

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-8 text-center shadow-2xl">
      <h1 className="text-xl font-bold text-white">Authentication Error</h1>
      <p className="mt-2 text-sm text-slate-400">
        Something went wrong during sign-in. Please try again.
      </p>
      <Link
        href="/sign-in"
        className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
      >
        Back to Sign In
      </Link>
    </div>
  );
}
