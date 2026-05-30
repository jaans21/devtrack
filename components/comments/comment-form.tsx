"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createComment } from "@/lib/actions/comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CommentForm({ issueId }: { issueId: string }) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    const result = await createComment({ issueId, body });
    if (!result.success) {
      toast.error(result.error);
    } else {
      setBody("");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a comment..."
        rows={3}
        className="text-sm resize-none"
      />
      <div className="flex justify-end">
        <Button size="sm" type="submit" disabled={loading || !body.trim()}>
          {loading ? "Posting..." : "Comment"}
        </Button>
      </div>
    </form>
  );
}
