import type { ReviewStatus } from "@prisma/client";
import { cn } from "@/lib/utils/cn";

const STATUS_CONFIG: Record<ReviewStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-slate-100 text-slate-600 dark:bg-slate-800" },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-700 dark:bg-green-900/30" },
  CHANGES_REQUESTED: { label: "Changes", className: "bg-red-100 text-red-700 dark:bg-red-900/30" },
  COMMENTED: { label: "Commented", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30" },
  DISMISSED: { label: "Dismissed", className: "bg-slate-100 text-slate-500 dark:bg-slate-800" },
};

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn("rounded-full px-1.5 py-0.5 text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
}
