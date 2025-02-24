import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Comment, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";

export default function CommentSection({ postId }: { postId: number }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: ["/api/posts", postId, "comments"],
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await apiRequest("DELETE", `/api/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/posts", postId, "comments"],
      });
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await apiRequest("POST", `/api/posts/${postId}/comments`, { content });
      queryClient.invalidateQueries({
        queryKey: ["/api/posts", postId, "comments"],
      });
      setContent("");
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Comments</h2>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Comment
          </Button>
        </form>
      ) : (
        <p className="text-muted-foreground">
          Please <a href="/auth" className="text-primary">login</a> to comment
        </p>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-full h-20 rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : comments?.length === 0 ? (
        <p className="text-muted-foreground">No comments yet</p>
      ) : (
        <div className="space-y-4">
          {comments?.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={() => deleteCommentMutation.mutate(comment.id)}
              currentUser={user}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  onDelete,
  currentUser,
}: {
  comment: Comment;
  onDelete: () => void;
  currentUser: User | null;
}) {
  const { data: author } = useQuery<User>({
    queryKey: ["/api/user", comment.authorId],
  });

  return (
    <div className="flex gap-4 p-4 rounded-lg bg-muted/50">
      <div className="flex-grow">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">{author?.username}</div>
          <div className="text-sm text-muted-foreground">
            {new Date(comment.createdAt).toLocaleDateString()}
          </div>
        </div>
        <p>{comment.content}</p>
      </div>
      {currentUser?.id === comment.authorId && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8 text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
