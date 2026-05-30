import { auth } from "@/lib/auth";
import type { ZodSchema } from "zod";
import type { ActionResult } from "@/types";

export function createAction<TInput, TOutput>(
  schema: ZodSchema<TInput>,
  handler: (input: TInput, userId: string) => Promise<TOutput>
) {
  return async (rawInput: unknown): Promise<ActionResult<TOutput>> => {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = schema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    try {
      const data = await handler(parsed.data, session.user.id);
      return { success: true, data };
    } catch (e) {
      const message = e instanceof Error ? e.message : "An unexpected error occurred";
      return { success: false, error: message };
    }
  };
}
