"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type FormData = z.infer<typeof schema>;

export function SignUpForm() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });
      if (!res.ok) {
        const { error } = (await res.json()) as { error: string };
        toast.error(error ?? "Registration failed");
        return;
      }
      await signIn("credentials", { email: data.email, password: data.password, callbackUrl: "/" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-slate-300">Full Name</Label>
        <Input id="name" placeholder="Alice Chen" {...register("name")}
          className="mt-1 border-slate-600 bg-slate-700 text-white placeholder:text-slate-500" />
        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="email" className="text-slate-300">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" {...register("email")}
          className="mt-1 border-slate-600 bg-slate-700 text-white placeholder:text-slate-500" />
        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="password" className="text-slate-300">Password</Label>
        <Input id="password" type="password" placeholder="Min. 8 characters" {...register("password")}
          className="mt-1 border-slate-600 bg-slate-700 text-white placeholder:text-slate-500" />
        {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
      </div>
      <div>
        <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
        <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")}
          className="mt-1 border-slate-600 bg-slate-700 text-white placeholder:text-slate-500" />
        {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={loading}>
        {loading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
