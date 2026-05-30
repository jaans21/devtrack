"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createIssue } from "@/lib/actions/issues";
import { createIssueSchema, type CreateIssueInput } from "@/lib/validations/issue";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import type { Label as PrismaLabel } from "@prisma/client";

interface CreateIssueDialogProps {
  projectId: string;
  projectKey: string;
  members: { id: string; name: string | null; image: string | null }[];
  labels: PrismaLabel[];
}

export function CreateIssueDialog({ projectId, projectKey, members, labels }: CreateIssueDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateIssueInput>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: { projectId, status: "BACKLOG", priority: "NO_PRIORITY", type: "TASK" },
  });

  async function onSubmit(data: CreateIssueInput) {
    setLoading(true);
    const result = await createIssue(data);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success(`${projectKey}-${result.data.number} created`);
      reset();
      setOpen(false);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" />
          New Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Issue</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <input type="hidden" {...register("projectId")} />

          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Issue title..." {...register("title")} className="mt-1" />
            {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} placeholder="Add details..." {...register("description")} className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select defaultValue="NO_PRIORITY" onValueChange={(v) => setValue("priority", v as CreateIssueInput["priority"])}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["URGENT", "HIGH", "MEDIUM", "LOW", "NO_PRIORITY"] as const).map((p) => (
                    <SelectItem key={p} value={p}>{p.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Type</Label>
              <Select defaultValue="TASK" onValueChange={(v) => setValue("type", v as CreateIssueInput["type"])}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["BUG", "FEATURE", "TASK", "IMPROVEMENT", "EPIC"] as const).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Assignee</Label>
            <Select onValueChange={(v) => setValue("assigneeId", v === "none" ? null : v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name ?? m.id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Issue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
