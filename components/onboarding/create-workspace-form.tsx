"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createWorkspaceSchema, type CreateWorkspaceInput } from "@/lib/validations/workspace";
import { createWorkspace } from "@/lib/actions/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/utils/format";

export function CreateWorkspaceForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateWorkspaceInput>({ resolver: zodResolver(createWorkspaceSchema) });

  async function onSubmit(data: CreateWorkspaceInput) {
    setLoading(true);
    const result = await createWorkspace(data);
    if (!result.success) {
      toast.error(result.error);
      setLoading(false);
      return;
    }
    toast.success("Workspace created!");
    router.push(`/${result.data.slug}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-slate-300">Workspace Name</Label>
        <Input
          id="name"
          placeholder="Acme Corp"
          {...register("name", {
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              setValue("slug", slugify(e.target.value)),
          })}
          className="mt-1 border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
        />
        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="slug" className="text-slate-300">URL Slug</Label>
        <div className="mt-1 flex rounded-lg border border-slate-600 bg-slate-700 focus-within:ring-2 focus-within:ring-blue-500">
          <span className="flex items-center px-3 text-sm text-slate-400">devtrack.app/</span>
          <Input
            id="slug"
            placeholder="acme-corp"
            {...register("slug")}
            className="border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0"
          />
        </div>
        {errors.slug && <p className="mt-1 text-xs text-red-400">{errors.slug.message}</p>}
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={loading}>
        {loading ? "Creating..." : "Create Workspace"}
      </Button>
    </form>
  );
}
