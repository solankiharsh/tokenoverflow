import { and, desc, eq } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { getDb } from "../db";
import { posts, type Post } from "../db/schema";

export interface BlogPost {
	slug: string;
	title: string;
	date: string;
	excerpt: string;
	content: string;
}

function rowToBlogPost(row: Post): BlogPost {
	return {
		slug: row.slug,
		title: row.title,
		date: row.createdAt,
		excerpt: row.excerpt ?? "",
		content: row.content,
	};
}

export async function getPosts(d1: AnyD1Database): Promise<BlogPost[]> {
	const db = getDb(d1);
	const rows = await db
		.select()
		.from(posts)
		.where(eq(posts.status, "published"))
		.orderBy(desc(posts.createdAt));
	return rows.map(rowToBlogPost);
}

export async function getPost(
	d1: AnyD1Database,
	slug: string,
): Promise<BlogPost | null> {
	const db = getDb(d1);
	const rows = await db
		.select()
		.from(posts)
		.where(and(eq(posts.slug, slug), eq(posts.status, "published")))
		.limit(1);
	const row = rows[0];
	return row ? rowToBlogPost(row) : null;
}

export interface PostForAdmin extends BlogPost {
	id: string;
	status: "draft" | "published";
	createdAt: string;
	updatedAt: string;
}

function rowToPostForAdmin(row: Post): PostForAdmin {
	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		date: row.createdAt,
		excerpt: row.excerpt ?? "",
		content: row.content,
		status: row.status,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export async function getAllPostsAdmin(
	d1: AnyD1Database,
): Promise<PostForAdmin[]> {
	const db = getDb(d1);
	const rows = await db.select().from(posts).orderBy(desc(posts.updatedAt));
	return rows.map(rowToPostForAdmin);
}

export async function getPostByIdForAdmin(
	d1: AnyD1Database,
	id: string,
): Promise<PostForAdmin | null> {
	const db = getDb(d1);
	const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
	const row = rows[0];
	return row ? rowToPostForAdmin(row) : null;
}

export interface CreatePostInput {
	slug: string;
	title: string;
	excerpt?: string;
	content: string;
	status?: "draft" | "published";
}

export async function createPost(
	d1: AnyD1Database,
	input: CreatePostInput,
): Promise<Post> {
	const db = getDb(d1);
	const id = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
	const now = new Date().toISOString();
	const [row] = await db
		.insert(posts)
		.values({
			id,
			slug: input.slug,
			title: input.title,
			excerpt: input.excerpt ?? "",
			content: input.content,
			status: input.status ?? "draft",
			createdAt: now,
			updatedAt: now,
		})
		.returning();
	if (!row) throw new Error("Insert failed");
	return row;
}

export interface UpdatePostInput {
	slug?: string;
	title?: string;
	excerpt?: string;
	content?: string;
	status?: "draft" | "published";
}

export async function updatePost(
	d1: AnyD1Database,
	id: string,
	input: UpdatePostInput,
): Promise<Post | null> {
	const db = getDb(d1);
	const now = new Date().toISOString();
	const [row] = await db
		.update(posts)
		.set({
			...(input.slug !== undefined && { slug: input.slug }),
			...(input.title !== undefined && { title: input.title }),
			...(input.excerpt !== undefined && { excerpt: input.excerpt }),
			...(input.content !== undefined && { content: input.content }),
			...(input.status !== undefined && { status: input.status }),
			updatedAt: now,
		})
		.where(eq(posts.id, id))
		.returning();
	return row ?? null;
}

export async function deletePost(
	d1: AnyD1Database,
	id: string,
): Promise<void> {
	const db = getDb(d1);
	await db.delete(posts).where(eq(posts.id, id));
}
