import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/rich-text-editor";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Image as ImageIcon } from "lucide-react";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiRequest("POST", "/api/posts", {
        title,
        content,
        imageUrl: imageUrl || undefined,
      });
      const post = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Post created successfully",
      });
      setLocation(`/posts/${post.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container py-8 max-w-4xl">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                placeholder="Post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold"
              />
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Image URL (optional)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                type="url"
              />
              {imageUrl && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setImageUrl("")}
                >
                  Clear
                </Button>
              )}
            </div>

            {imageUrl && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/600x400?text=Error+loading+image";
                  }}
                />
              </div>
            )}

            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write your post content here..."
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Publish
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
