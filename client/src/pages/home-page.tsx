import { useQuery } from "@tanstack/react-query";
import { Post } from "@shared/schema";
import PostCard from "@/components/post-card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";

export default function HomePage() {
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Recent Posts</h1>
        <Link href="/posts/new">
          <Button>
            <PenSquare className="w-4 h-4 mr-2" />
            Write a Post
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-full h-48 rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : posts?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No posts yet. Be the first to write one!
        </div>
      ) : (
        <div className="grid gap-6">
          {posts?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
