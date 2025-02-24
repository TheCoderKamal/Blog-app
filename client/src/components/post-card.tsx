import { Link } from "wouter";
import { Post, User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

export default function PostCard({ post }: { post: Post }) {
  const { data: author } = useQuery<User>({
    queryKey: ["/api/user", post.authorId],
  });

  const excerpt = post.content
    .replace(/<[^>]*>/g, "")
    .slice(0, 200)
    .trim()
    .concat("...");

  return (
    <Card className="overflow-hidden hover:bg-muted/50 transition-colors">
      <Link href={`/posts/${post.id}`}>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-[1fr_300px] gap-6">
            <div className="flex flex-col">
              <h2 className="text-xl md:text-2xl font-bold mb-2 line-clamp-2">
                {post.title}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                By {author?.username} •{" "}
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
              <p className="line-clamp-3 text-muted-foreground">{excerpt}</p>
            </div>
            {post.imageUrl && (
              <div className="order-first md:order-last aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}