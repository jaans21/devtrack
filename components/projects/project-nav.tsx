"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { Project } from "@prisma/client";

interface ProjectNavProps {
  project: Pick<Project, "id" | "name" | "key" | "color">;
  workspaceSlug: string;
}

export function ProjectNav({ project, workspaceSlug }: ProjectNavProps) {
  const pathname = usePathname();
  const base = `/${workspaceSlug}/projects/${project.id}`;

  const tabs = [
    { label: "Board", href: `${base}/board` },
    { label: "Issues", href: `${base}/issues` },
    { label: "Sprints", href: `${base}/sprints` },
    { label: "Reviews", href: `${base}/reviews` },
  ];

  return (
    <div className="border-b border-border bg-card px-6">
      <div className="flex items-center gap-3 py-3">
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white"
          style={{ backgroundColor: project.color }}
        >
          {project.key[0]}
        </span>
        <h1 className="font-semibold text-foreground">{project.name}</h1>
        <span className="text-xs text-muted-foreground">{project.key}</span>
      </div>
      <nav className="-mb-px flex gap-1">
        {tabs.map(({ label, href }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
