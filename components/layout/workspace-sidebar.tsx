"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Bell, Settings, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Project, Workspace } from "@prisma/client";

interface WorkspaceSidebarProps {
  workspace: Pick<Workspace, "id" | "slug" | "name">;
  projects: Pick<Project, "id" | "key" | "name" | "color">[];
}

export function WorkspaceSidebar({ workspace, projects }: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const base = `/${workspace.slug}`;

  const navLinks = [
    { label: "Overview", href: base, icon: LayoutDashboard },
    { label: "Notifications", href: `${base}/notifications`, icon: Bell },
    { label: "Settings", href: `${base}/settings`, icon: Settings },
  ];

  return (
    <aside className="flex w-56 flex-col border-r border-border bg-card">
      {/* Workspace name */}
      <div className="flex h-14 items-center border-b border-border px-4">
        <span className="font-semibold text-foreground truncate">{workspace.name}</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Main nav */}
        <div className="space-y-1">
          {navLinks.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                pathname === href
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </div>

        {/* Projects */}
        <div>
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Projects
            </span>
            <Link href={`${base}/projects/new`} className="text-muted-foreground hover:text-foreground">
              <Plus className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-1 space-y-0.5">
            {projects.map((p) => {
              const projectBase = `${base}/projects/${p.id}`;
              const active = pathname.startsWith(projectBase);
              return (
                <Link
                  key={p.id}
                  href={`${projectBase}/board`}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="truncate">{p.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{p.key}</span>
                </Link>
              );
            })}
            {projects.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">No projects yet</p>
            )}
          </div>
        </div>
      </nav>
    </aside>
  );
}
