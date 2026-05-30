"use client";

import { useState } from "react";
import { toast } from "sonner";
import { timeAgo } from "@/lib/utils/format";
import { updateComment, deleteComment } from "@/lib/actions/comments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Comment, User } from "@prisma/client";

type CommentWithAuthor = Comment & { author: Pick<User, "id" | "name" | "image"> };

interface CommentItemProps {
  comment: CommentWithAuthor;
  isAuthor: boolean;
}

export function CommentItem({ comment, isAuthor }: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(comment.body);
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    setLoading(true);
    const result = await updateComment({ id: comment.id, body });
    if (!result.success) toast.error(result.error);
    else setEditing(false);
    setLoading(false);
  }

  async function handleDelete() {
    const result = await deleteComment({ id: comment.id });
    if (!result.success) toast.error(result.error);
  }

  return (
    <li className="flex gap-3">
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarImage src={comment.author.image ?? undefined} />
        <AvatarFallback className="text-xs">{comment.author.name?.[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">{comment.author.name}</span>
          <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
          {comment.editedAt && <span className="text-xs text-muted-foreground">(edited)</span>}
        </div>
        {editing ? (
          <div className="mt-2 space-y-2">
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} className="text-sm" />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleUpdate} disabled={loading}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setBody(comment.body); }}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm whitespace-pre-wrap">{body}</p>
        )}
        {isAuthor && !editing && (
          <div className="mt-1 flex gap-2">
            <button onClick={() => setEditing(true)} className="text-xs text-muted-foreground hover:text-foreground">
              Edit
            </button>
            <button onClick={handleDelete} className="text-xs text-muted-foreground hover:text-destructive">
              Delete
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
