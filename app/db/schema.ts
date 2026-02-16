import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable("posts", {
	id: text("id").primaryKey(),
	slug: text("slug").notNull().unique(),
	title: text("title").notNull(),
	excerpt: text("excerpt").default(""),
	content: text("content").notNull(),
	status: text("status", { enum: ["draft", "published"] })
		.notNull()
		.default("draft"),
	createdAt: text("created_at").notNull().default(""),
	updatedAt: text("updated_at").notNull().default(""),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
