import { and, desc, eq, like, or, sql, count, sum, avg } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { getDb } from "../db";
import {
	contacts,
	deals,
	activities,
	formSubmissions,
	dealStageHistory,
	type Contact,
	type Deal,
	type Activity,
	type FormSubmission,
} from "../db/schema";

function generateId(): string {
	return crypto.randomUUID().replace(/-/g, "").slice(0, 32);
}

// --------------- Contacts ---------------

export interface ContactInput {
	firstName: string;
	lastName?: string;
	email: string;
	company?: string;
	role?: string;
	phone?: string;
	linkedin?: string;
	source?: string;
	tags?: string[];
}

export async function createContact(
	d1: AnyD1Database,
	input: ContactInput,
): Promise<Contact> {
	const db = getDb(d1);
	const id = generateId();
	const now = new Date().toISOString();
	const email = input.email.toLowerCase().trim();

	const existing = await db
		.select()
		.from(contacts)
		.where(eq(contacts.email, email))
		.limit(1);

	if (existing[0]) {
		const [updated] = await db
			.update(contacts)
			.set({
				firstName: input.firstName || existing[0].firstName,
				lastName: input.lastName ?? existing[0].lastName,
				company: input.company ?? existing[0].company,
				role: input.role ?? existing[0].role,
				updatedAt: now,
			})
			.where(eq(contacts.email, email))
			.returning();
		return updated!;
	}

	const [row] = await db
		.insert(contacts)
		.values({
			id,
			firstName: input.firstName,
			lastName: input.lastName ?? null,
			email,
			company: input.company ?? null,
			role: input.role ?? null,
			phone: input.phone ?? null,
			linkedin: input.linkedin ?? null,
			source: input.source ?? "website",
			tags: JSON.stringify(input.tags ?? []),
			createdAt: now,
			updatedAt: now,
		})
		.returning();
	return row!;
}

export interface GetContactsOpts {
	source?: string;
	search?: string;
	limit?: number;
	offset?: number;
}

export async function getContacts(
	d1: AnyD1Database,
	opts: GetContactsOpts = {},
): Promise<Contact[]> {
	const db = getDb(d1);
	const { source, search, limit = 50, offset = 0 } = opts;
	const conditions = [];

	if (source) {
		conditions.push(eq(contacts.source, source));
	}
	if (search) {
		const term = `%${search}%`;
		conditions.push(
			or(
				like(contacts.firstName, term),
				like(contacts.lastName, term),
				like(contacts.email, term),
				like(contacts.company, term),
			)!,
		);
	}

	const where = conditions.length > 0 ? and(...conditions) : undefined;
	return db
		.select()
		.from(contacts)
		.where(where)
		.orderBy(desc(contacts.createdAt))
		.limit(limit)
		.offset(offset);
}

export interface ContactDetail extends Contact {
	deals: Deal[];
	activities: Activity[];
}

export async function getContact(
	d1: AnyD1Database,
	id: string,
): Promise<ContactDetail | null> {
	const db = getDb(d1);
	const rows = await db
		.select()
		.from(contacts)
		.where(eq(contacts.id, id))
		.limit(1);
	const contact = rows[0];
	if (!contact) return null;

	const contactDeals = await db
		.select()
		.from(deals)
		.where(eq(deals.contactId, id))
		.orderBy(desc(deals.createdAt));

	const contactActivities = await db
		.select()
		.from(activities)
		.where(eq(activities.contactId, id))
		.orderBy(desc(activities.createdAt))
		.limit(20);

	return { ...contact, deals: contactDeals, activities: contactActivities };
}

export interface UpdateContactInput {
	firstName?: string;
	lastName?: string;
	company?: string;
	role?: string;
	phone?: string;
	linkedin?: string;
	source?: string;
	tags?: string[];
}

export async function updateContact(
	d1: AnyD1Database,
	id: string,
	input: UpdateContactInput,
): Promise<Contact | null> {
	const db = getDb(d1);
	const now = new Date().toISOString();
	const [row] = await db
		.update(contacts)
		.set({
			...(input.firstName !== undefined && { firstName: input.firstName }),
			...(input.lastName !== undefined && { lastName: input.lastName }),
			...(input.company !== undefined && { company: input.company }),
			...(input.role !== undefined && { role: input.role }),
			...(input.phone !== undefined && { phone: input.phone }),
			...(input.linkedin !== undefined && { linkedin: input.linkedin }),
			...(input.source !== undefined && { source: input.source }),
			...(input.tags !== undefined && {
				tags: JSON.stringify(input.tags),
			}),
			updatedAt: now,
		})
		.where(eq(contacts.id, id))
		.returning();
	return row ?? null;
}

export async function deleteContact(
	d1: AnyD1Database,
	id: string,
): Promise<void> {
	const db = getDb(d1);
	await db.delete(contacts).where(eq(contacts.id, id));
}

// --------------- Deals ---------------

export interface DealInput {
	contactId: string;
	title: string;
	stage?: string;
	value?: number;
	currency?: string;
	description?: string;
	expectedClose?: string;
}

export async function createDeal(
	d1: AnyD1Database,
	input: DealInput,
): Promise<Deal> {
	const db = getDb(d1);
	const id = generateId();
	const now = new Date().toISOString();
	const stage = (input.stage ?? "lead") as Deal["stage"];

	const [row] = await db
		.insert(deals)
		.values({
			id,
			contactId: input.contactId,
			title: input.title,
			stage,
			value: input.value ?? null,
			currency: input.currency ?? "USD",
			description: input.description ?? null,
			expectedClose: input.expectedClose ?? null,
			createdAt: now,
			updatedAt: now,
		})
		.returning();

	await db.insert(dealStageHistory).values({
		id: generateId(),
		dealId: id,
		fromStage: null,
		toStage: stage,
		changedAt: now,
	});

	return row!;
}

export async function updateDealStage(
	d1: AnyD1Database,
	dealId: string,
	newStage: string,
	lostReason?: string,
): Promise<{ dealId: string; from: string; to: string }> {
	const db = getDb(d1);
	const now = new Date().toISOString();

	const rows = await db
		.select({ stage: deals.stage })
		.from(deals)
		.where(eq(deals.id, dealId))
		.limit(1);
	const deal = rows[0];
	if (!deal) throw new Error("Deal not found");

	await db
		.update(deals)
		.set({
			stage: newStage as Deal["stage"],
			lostReason: lostReason ?? null,
			updatedAt: now,
		})
		.where(eq(deals.id, dealId));

	await db.insert(dealStageHistory).values({
		id: generateId(),
		dealId,
		fromStage: deal.stage,
		toStage: newStage as Deal["stage"],
		changedAt: now,
	});

	return { dealId, from: deal.stage, to: newStage };
}

export type DealWithContact = Deal & {
	contactFirstName: string | null;
	contactLastName: string | null;
	contactEmail: string;
	contactCompany: string | null;
};

const PIPELINE_STAGES = [
	"lead",
	"qualified",
	"proposal",
	"negotiation",
	"won",
	"lost",
] as const;

export async function getDealsPipeline(
	d1: AnyD1Database,
): Promise<Record<string, DealWithContact[]>> {
	const db = getDb(d1);
	const pipeline: Record<string, DealWithContact[]> = {};

	for (const stage of PIPELINE_STAGES) {
		const rows = await db
			.select({
				id: deals.id,
				contactId: deals.contactId,
				title: deals.title,
				stage: deals.stage,
				value: deals.value,
				currency: deals.currency,
				description: deals.description,
				expectedClose: deals.expectedClose,
				lostReason: deals.lostReason,
				createdAt: deals.createdAt,
				updatedAt: deals.updatedAt,
				contactFirstName: contacts.firstName,
				contactLastName: contacts.lastName,
				contactEmail: contacts.email,
				contactCompany: contacts.company,
			})
			.from(deals)
			.innerJoin(contacts, eq(deals.contactId, contacts.id))
			.where(eq(deals.stage, stage))
			.orderBy(desc(deals.updatedAt));
		pipeline[stage] = rows;
	}

	return pipeline;
}

// --------------- Activities ---------------

export interface ActivityInput {
	contactId?: string;
	dealId?: string;
	type: string;
	title: string;
	body?: string;
	metadata?: Record<string, unknown>;
}

export async function logActivity(
	d1: AnyD1Database,
	input: ActivityInput,
): Promise<Activity> {
	const db = getDb(d1);
	const id = generateId();
	const now = new Date().toISOString();

	const [row] = await db
		.insert(activities)
		.values({
			id,
			contactId: input.contactId ?? null,
			dealId: input.dealId ?? null,
			type: input.type,
			title: input.title,
			body: input.body ?? null,
			metadata: JSON.stringify(input.metadata ?? {}),
			createdAt: now,
		})
		.returning();

	return row!;
}

// --------------- Form Submissions ---------------

export interface FormSubmissionInput {
	formType: string;
	name?: string;
	email: string;
	company?: string;
	message?: string;
	metadata?: Record<string, unknown>;
}

export async function handleFormSubmission(
	d1: AnyD1Database,
	input: FormSubmissionInput,
): Promise<{ submissionId: string; contact: Contact }> {
	const db = getDb(d1);
	const id = generateId();
	const now = new Date().toISOString();

	await db.insert(formSubmissions).values({
		id,
		formType: input.formType,
		name: input.name ?? null,
		email: input.email.toLowerCase().trim(),
		company: input.company ?? null,
		message: input.message ?? null,
		metadata: JSON.stringify(input.metadata ?? {}),
		status: "new",
		createdAt: now,
	});

	const nameParts = (input.name ?? "").split(" ");
	const contact = await createContact(d1, {
		firstName: nameParts[0] || input.email.split("@")[0],
		lastName: nameParts.slice(1).join(" ") || undefined,
		email: input.email,
		company: input.company,
		source: input.formType === "newsletter" ? "newsletter" : "website",
	});

	await db
		.update(formSubmissions)
		.set({ contactId: contact.id })
		.where(eq(formSubmissions.id, id));

	if (input.formType === "contact") {
		await createDeal(d1, {
			contactId: contact.id,
			title: input.company
				? `Inquiry from ${input.company}`
				: `Inquiry from ${input.name || input.email}`,
			stage: "lead",
			description: input.message,
		});
	}

	await logActivity(d1, {
		contactId: contact.id,
		type: "form_submission",
		title: `${input.formType} form submitted`,
		body: input.message,
		metadata: input.metadata,
	});

	return { submissionId: id, contact };
}

const SUBMISSION_STATUSES = [
	"new",
	"contacted",
	"converted",
	"archived",
] as const satisfies readonly FormSubmission["status"][];

export async function getSubmissions(
	d1: AnyD1Database,
	status?: string,
): Promise<FormSubmission[]> {
	const db = getDb(d1);
	const validStatus =
		status &&
		(SUBMISSION_STATUSES as readonly string[]).includes(status)
			? (status as FormSubmission["status"])
			: undefined;
	const where = validStatus
		? eq(formSubmissions.status, validStatus)
		: undefined;
	return db
		.select()
		.from(formSubmissions)
		.where(where)
		.orderBy(desc(formSubmissions.createdAt))
		.limit(100);
}

// --------------- Analytics ---------------

export interface PipelineStats {
	pipeline: Array<{
		stage: string;
		count: number;
		totalValue: number;
		avgValue: number;
	}>;
	submissions30d: number;
	conversionRate90d: string;
}

export async function getPipelineStats(
	d1: AnyD1Database,
): Promise<PipelineStats> {
	const db = getDb(d1);

	const stageStats = await db
		.select({
			stage: deals.stage,
			count: count(),
			totalValue: sum(deals.value),
			avgValue: avg(deals.value),
		})
		.from(deals)
		.groupBy(deals.stage);

	const pipeline = stageStats.map((row) => ({
		stage: row.stage,
		count: row.count,
		totalValue: Number(row.totalValue ?? 0),
		avgValue: Number(row.avgValue ?? 0),
	}));

	const [sub30] = await db
		.select({ count: count() })
		.from(formSubmissions)
		.where(sql`${formSubmissions.createdAt} > datetime('now', '-30 days')`);

	const [conv90] = await db
		.select({
			rate: sql<number>`CAST(SUM(CASE WHEN ${deals.stage} = 'won' THEN 1 ELSE 0 END) AS REAL) / NULLIF(COUNT(*), 0) * 100`,
		})
		.from(deals)
		.where(sql`${deals.createdAt} > datetime('now', '-90 days')`);

	return {
		pipeline,
		submissions30d: sub30?.count ?? 0,
		conversionRate90d: (conv90?.rate ?? 0).toFixed(1),
	};
}
