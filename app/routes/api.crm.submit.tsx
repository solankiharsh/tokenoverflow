import type { Route } from "./+types/api.crm.submit";
import { isValidEmail } from "../lib/email-validation";
import { loadContextKey } from "../lib/load-context";
import { handleFormSubmission } from "../data/crm";

export async function action({ request, context }: Route.ActionArgs) {
	if (request.method !== "POST") {
		return Response.json({ error: "Method not allowed" }, { status: 405 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const { email, form_type, name, company, message, metadata } = body as Record<string, unknown>;

	if (!email || typeof email !== "string" || !form_type || typeof form_type !== "string") {
		return Response.json(
			{ error: "email and form_type are required" },
			{ status: 400 },
		);
	}

	if (!isValidEmail(email)) {
		return Response.json({ error: "Invalid email address" }, { status: 400 });
	}

	const env = context.get(loadContextKey).cloudflare.env as {
		DB: Parameters<typeof handleFormSubmission>[0];
	};
	if (!env.DB) {
		return Response.json(
			{ error: "Database not configured" },
			{ status: 503 },
		);
	}

	try {
		const result = await handleFormSubmission(env.DB, {
			formType: form_type,
			name: typeof name === "string" ? name : undefined,
			email,
			company: typeof company === "string" ? company : undefined,
			message: typeof message === "string" ? message : undefined,
			metadata:
				metadata && typeof metadata === "object"
					? (metadata as Record<string, unknown>)
					: undefined,
		});
		return Response.json(result, { status: 201 });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : "Internal error";
		return Response.json({ error: msg }, { status: 500 });
	}
}

export function loader() {
	return Response.json({ error: "Method not allowed" }, { status: 405 });
}
