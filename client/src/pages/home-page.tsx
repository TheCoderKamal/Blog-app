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
    <main className="min-h-screen py-8 px-4 md:px-8">
      <div className="container max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Recent Posts</h1>
          <Link href="/posts/new">
            <Button className="w-full sm:w-auto">
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
                className="w-full h-40 md:h-48 rounded-lg bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No posts yet. Be the first to write one!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts?.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}