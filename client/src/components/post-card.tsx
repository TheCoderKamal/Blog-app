import { Link } from "wouter";
import { Post, User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
    <Card className="hover:bg-muted/50 transition-colors">
      <Link href={`/posts/${post.id}`}>
        <CardHeader className="grid md:grid-cols-[1fr_300px] gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              By {author?.username} •{" "}
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
            <p className="line-clamp-3 text-muted-foreground">{excerpt}</p>
          </div>
          {post.imageUrl && (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </CardHeader>
      </Link>
    </Card>
  );
}
