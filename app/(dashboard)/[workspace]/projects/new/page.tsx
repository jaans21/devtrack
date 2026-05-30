import type { Metadata } from "next";
import { CreateProjectForm } from "@/components/projects/create-project-form";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "New Project" };

interface PageProps {
  params: Promise<{ workspace: string }>;
}

export default async function NewProjectPage({ params }: PageProps) {
  const { workspace: slug } = await params;
  const session = await auth();
  if (!session) redirect("/sign-in");

  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  if (!workspace) notFound();

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="mb-6 text-2xl font-bold">New Project</h1>
      <CreateProjectForm workspaceId={workspace.id} workspaceSlug={slug} />
    </div>
  );
}
