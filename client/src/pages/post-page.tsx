import { useQuery } from "@tanstack/react-query";
import { Post, User } from "@shared/schema";
import { useParams, useLocation } from "wouter";
import CommentSection from "@/components/comment-section";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function PostPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: post, isLoading } = useQuery<Post>({
    queryKey: ["/api/posts", id],
  });

  const { data: author } = useQuery<User>({
    queryKey: ["/api/user", post?.authorId],
    enabled: !!post,
  });

  async function handleDelete() {
    try {
      await apiRequest("DELETE", `/api/posts/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="w-full h-96 rounded-lg bg-muted animate-pulse" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold">Post not found</h1>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <article className="prose prose-stone dark:prose-invert max-w-none">
        <header className="not-prose mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center justify-between text-muted-foreground">
            <div>
              By {author?.username} •{" "}
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
            {user?.id === post.authorId && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/posts/${id}/edit`}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </a>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete
                        your post and all its comments.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </header>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full rounded-lg mb-8"
          />
        )}

        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>

      <hr className="my-8" />

      <CommentSection postId={post.id} />
    </div>
  );
}
