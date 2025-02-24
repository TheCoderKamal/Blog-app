import { User, Post, Comment, InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  
  createPost(post: Omit<Post, "id" | "createdAt">): Promise<Post>;
  getPost(id: number): Promise<Post | undefined>;
  getPosts(): Promise<Post[]>;
  updatePost(id: number, data: Partial<Post>): Promise<Post>;
  deletePost(id: number): Promise<void>;
  
  createComment(comment: Omit<Comment, "id" | "createdAt">): Promise<Comment>;
  getComments(postId: number): Promise<Comment[]>;
  deleteComment(id: number): Promise<void>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  private currentIds: { user: number; post: number; comment: number };
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.currentIds = { user: 1, post: 1, comment: 1 };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const user: User = { ...insertUser, id, bio: null, avatarUrl: null };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }

  async createPost(post: Omit<Post, "id" | "createdAt">): Promise<Post> {
    const id = this.currentIds.post++;
    const newPost: Post = {
      ...post,
      id,
      createdAt: new Date(),
    };
    this.posts.set(id, newPost);
    return newPost;
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async updatePost(id: number, data: Partial<Post>): Promise<Post> {
    const post = await this.getPost(id);
    if (!post) throw new Error("Post not found");
    const updated = { ...post, ...data };
    this.posts.set(id, updated);
    return updated;
  }

  async deletePost(id: number): Promise<void> {
    this.posts.delete(id);
    // Delete associated comments
    const comments = Array.from(this.comments.entries());
    for (const [commentId, comment] of comments) {
      if (comment.postId === id) {
        this.comments.delete(commentId);
      }
    }
  }

  async createComment(comment: Omit<Comment, "id" | "createdAt">): Promise<Comment> {
    const id = this.currentIds.comment++;
    const newComment: Comment = {
      ...comment,
      id,
      createdAt: new Date(),
    };
    this.comments.set(id, newComment);
    return newComment;
  }

  async getComments(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((comment) => comment.postId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async deleteComment(id: number): Promise<void> {
    this.comments.delete(id);
  }
}

export const storage = new MemStorage();