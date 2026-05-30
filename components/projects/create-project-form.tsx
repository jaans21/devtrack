"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createProjectSchema, type CreateProjectInput } from "@/lib/validations/project";
import { createProject } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateProjectFormProps {
  workspaceId: string;
  workspaceSlug: string;
}

export function CreateProjectForm({ workspaceId, workspaceSlug }: CreateProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { workspaceId, color: "#6366f1" },
  });

  async function onSubmit(data: CreateProjectInput) {
    setLoading(true);
    const result = await createProject(data);
    if (!result.success) {
      toast.error(result.error);
      setLoading(false);
      return;
    }
    toast.success("Project created!");
    router.push(`/${workspaceSlug}/projects/${result.data.id}/board`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input type="hidden" {...register("workspaceId")} />

      <div>
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          placeholder="Frontend"
          {...register("name", {
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              setValue(
                "key",
                e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z]/g, "")
                  .slice(0, 6)
              ),
          })}
          className="mt-1"
        />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="key">Project Key</Label>
        <Input id="key" placeholder="FE" maxLength={6} {...register("key")} className="mt-1" />
        <p className="mt-1 text-xs text-muted-foreground">
          Used in issue IDs, e.g. FE-42. Uppercase letters only.
        </p>
        {errors.key && <p className="mt-1 text-xs text-destructive">{errors.key.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" rows={3} {...register("description")} className="mt-1" />
      </div>

      <div>
        <Label htmlFor="repoUrl">GitHub Repo URL (optional)</Label>
        <Input
          id="repoUrl"
          placeholder="https://github.com/org/repo"
          {...register("repoUrl")}
          className="mt-1"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create Project"}
      </Button>
    </form>
  );
}
