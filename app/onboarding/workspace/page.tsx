import type { Metadata } from "next";
import { CreateWorkspaceForm } from "@/components/onboarding/create-workspace-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Create Workspace" };

export default function OnboardingWorkspacePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md px-4">
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-8 shadow-2xl backdrop-blur">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <span className="text-xl font-bold text-white">D</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Create your workspace</h1>
            <p className="mt-1 text-sm text-slate-400">
              A workspace is where your team collaborates on projects.
            </p>
          </div>
          <CreateWorkspaceForm />
        </div>
      </div>
    </div>
  );
}
