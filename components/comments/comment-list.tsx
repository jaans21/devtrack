import { CommentItem } from "./comment-item";
import type { Comment, User } from "@prisma/client";

type CommentWithAuthor = Comment & { author: Pick<User, "id" | "name" | "image"> };

interface CommentListProps {
  comments: CommentWithAuthor[];
  currentUserId: string;
}

export function CommentList({ comments, currentUserId }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment.</p>;
  }

  return (
    <ul className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} isAuthor={comment.authorId === currentUserId} />
      ))}
    </ul>
  );
}
