import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPostSchema, insertCommentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Get current user's profile
  app.get("/api/profile", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // Update user profile
  app.patch("/api/profile", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      const user = await storage.updateUser(req.user.id, req.body);
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Failed to update session" });
        res.json(user);
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Create post
  app.post("/api/posts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to create a post" });
      }

      const data = insertPostSchema.parse(req.body);
      const post = await storage.createPost({
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl ?? null,
        authorId: req.user.id,
      });

      res.status(201).json(post);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        next(error);
      }
    }
  });

  // Get all posts
  app.get("/api/posts", async (_req, res) => {
    const posts = await storage.getPosts();
    res.json(posts);
  });

  // Get single post
  app.get("/api/posts/:id", async (req, res) => {
    const post = await storage.getPost(Number(req.params.id));
    if (!post) return res.sendStatus(404);
    res.json(post);
  });

  // Update post
  app.patch("/api/posts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const post = await storage.getPost(Number(req.params.id));
    if (!post) return res.sendStatus(404);
    if (post.authorId !== req.user.id) return res.sendStatus(403);

    const updated = await storage.updatePost(post.id, req.body);
    res.json(updated);
  });

  // Delete post
  app.delete("/api/posts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const post = await storage.getPost(Number(req.params.id));
    if (!post) return res.sendStatus(404);
    if (post.authorId !== req.user.id) return res.sendStatus(403);

    await storage.deletePost(post.id);
    res.sendStatus(204);
  });

  // Get post comments
  app.get("/api/posts/:id/comments", async (req, res) => {
    const comments = await storage.getComments(Number(req.params.id));
    res.json(comments);
  });

  // Create comment
  app.post("/api/posts/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const data = insertCommentSchema.parse(req.body);
    const comment = await storage.createComment({
      ...data,
      authorId: req.user.id,
      postId: Number(req.params.id),
    });
    res.status(201).json(comment);
  });

  // Delete comment
  app.delete("/api/comments/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteComment(Number(req.params.id));
    res.sendStatus(204);
  });

  const httpServer = createServer(app);
  return httpServer;
}