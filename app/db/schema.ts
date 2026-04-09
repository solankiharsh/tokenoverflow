import { sql } from "drizzle-orm";
import {
	sqliteTable,
	text,
	real,
	integer,
	uniqueIndex,
	index,
} from "drizzle-orm/sqlite-core";

// --------------- Blog ---------------

export const posts = sqliteTable("posts", {
	id: text("id").primaryKey(),
	slug: text("slug").notNull().unique(),
	title: text("title").notNull(),
	excerpt: text("excerpt").default(""),
	content: text("content").notNull(),
	status: text("status", { enum: ["draft", "published"] })
		.notNull()
		.default("draft"),
	createdAt: text("created_at")
		.notNull()
		.default(sql`(datetime('now'))`),
	updatedAt: text("updated_at")
		.notNull()
		.default(sql`(datetime('now'))`),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

// --------------- CRM ---------------

export const contacts = sqliteTable(
	"contacts",
	{
		id: text("id").primaryKey(),
		firstName: text("first_name").notNull(),
		lastName: text("last_name"),
		email: text("email").notNull().unique(),
		company: text("company"),
		role: text("role"),
		phone: text("phone"),
		linkedin: text("linkedin"),
		source: text("source").notNull().default("website"),
		tags: text("tags").default("[]"),
		createdAt: text("created_at")
			.notNull()
			.default(sql`(datetime('now'))`),
		updatedAt: text("updated_at")
			.notNull()
			.default(sql`(datetime('now'))`),
	},
	(table) => [index("idx_contacts_source").on(table.source)],
);

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;

export const deals = sqliteTable(
	"deals",
	{
		id: text("id").primaryKey(),
		contactId: text("contact_id")
			.notNull()
			.references(() => contacts.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		stage: text("stage", {
			enum: ["lead", "qualified", "proposal", "negotiation", "won", "lost"],
		})
			.notNull()
			.default("lead"),
		value: real("value"),
		currency: text("currency").default("USD"),
		description: text("description"),
		expectedClose: text("expected_close"),
		lostReason: text("lost_reason"),
		createdAt: text("created_at")
			.notNull()
			.default(sql`(datetime('now'))`),
		updatedAt: text("updated_at")
			.notNull()
			.default(sql`(datetime('now'))`),
	},
	(table) => [
		index("idx_deals_stage").on(table.stage),
		index("idx_deals_contact").on(table.contactId),
	],
);

export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;

export const activities = sqliteTable(
	"activities",
	{
		id: text("id").primaryKey(),
		contactId: text("contact_id").references(() => contacts.id, {
			onDelete: "set null",
		}),
		dealId: text("deal_id").references(() => deals.id, {
			onDelete: "set null",
		}),
		type: text("type").notNull(),
		title: text("title").notNull(),
		body: text("body"),
		metadata: text("metadata").default("{}"),
		createdAt: text("created_at")
			.notNull()
			.default(sql`(datetime('now'))`),
	},
	(table) => [
		index("idx_activities_contact").on(table.contactId),
		index("idx_activities_deal").on(table.dealId),
		index("idx_activities_type").on(table.type),
	],
);

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

export const formSubmissions = sqliteTable(
	"form_submissions",
	{
		id: text("id").primaryKey(),
		formType: text("form_type").notNull(),
		name: text("name"),
		email: text("email").notNull(),
		company: text("company"),
		message: text("message"),
		metadata: text("metadata").default("{}"),
		status: text("status", {
			enum: ["new", "contacted", "converted", "archived"],
		})
			.notNull()
			.default("new"),
		contactId: text("contact_id").references(() => contacts.id),
		createdAt: text("created_at")
			.notNull()
			.default(sql`(datetime('now'))`),
	},
	(table) => [
		index("idx_submissions_status").on(table.status),
		index("idx_submissions_email").on(table.email),
	],
);

export type FormSubmission = typeof formSubmissions.$inferSelect;
export type NewFormSubmission = typeof formSubmissions.$inferInsert;

export const emailSequences = sqliteTable("email_sequences", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	steps: text("steps").notNull().default("[]"),
	active: integer("active").notNull().default(1),
	createdAt: text("created_at")
		.notNull()
		.default(sql`(datetime('now'))`),
});

export type EmailSequence = typeof emailSequences.$inferSelect;

export const sequenceEnrollments = sqliteTable(
	"sequence_enrollments",
	{
		id: text("id").primaryKey(),
		contactId: text("contact_id")
			.notNull()
			.references(() => contacts.id, { onDelete: "cascade" }),
		sequenceId: text("sequence_id")
			.notNull()
			.references(() => emailSequences.id, { onDelete: "cascade" }),
		currentStep: integer("current_step").notNull().default(0),
		status: text("status", {
			enum: ["active", "completed", "paused", "unsubscribed"],
		})
			.notNull()
			.default("active"),
		nextSendAt: text("next_send_at"),
		createdAt: text("created_at")
			.notNull()
			.default(sql`(datetime('now'))`),
		updatedAt: text("updated_at")
			.notNull()
			.default(sql`(datetime('now'))`),
	},
	(table) => [
		uniqueIndex("idx_enrollments_unique").on(
			table.contactId,
			table.sequenceId,
		),
		index("idx_enrollments_next").on(table.nextSendAt),
	],
);

export type SequenceEnrollment = typeof sequenceEnrollments.$inferSelect;

export const dealStageHistory = sqliteTable(
	"deal_stage_history",
	{
		id: text("id").primaryKey(),
		dealId: text("deal_id")
			.notNull()
			.references(() => deals.id, { onDelete: "cascade" }),
		fromStage: text("from_stage"),
		toStage: text("to_stage").notNull(),
		changedAt: text("changed_at")
			.notNull()
			.default(sql`(datetime('now'))`),
	},
	(table) => [index("idx_stage_history_deal").on(table.dealId)],
);

export type DealStageHistory = typeof dealStageHistory.$inferSelect;
