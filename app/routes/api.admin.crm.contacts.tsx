import type { Route } from "./+types/api.admin.crm.contacts";
import { requireAdmin } from "../lib/admin-auth";
import { loadContextKey } from "../lib/load-context";
import { getContacts, createContact } from "../data/crm";

export async function loader(args: Route.LoaderArgs) {
	await requireAdmin(args);
	const env = args.context.get(loadContextKey).cloudflare.env as {
		DB: Parameters<typeof getContacts>[0];
	};

	const url = new URL(args.request.url);
	const source = url.searchParams.get("source") ?? undefined;
	const search = url.searchParams.get("q") ?? undefined;
	const limit = Number.parseInt(url.searchParams.get("limit") ?? "50", 10);
	const offset = Number.parseInt(url.searchParams.get("offset") ?? "0", 10);

	const contacts = await getContacts(env.DB, { source, search, limit, offset });
	return Response.json({ contacts });
}

export async function action(args: Route.ActionArgs) {
	await requireAdmin(args);
	if (args.request.method !== "POST") {
		return Response.json({ error: "Method not allowed" }, { status: 405 });
	}

	const env = args.context.get(loadContextKey).cloudflare.env as {
		DB: Parameters<typeof createContact>[0];
	};
	const raw = await args.request.json();
	const body = raw as Record<string, unknown>;
	const firstName = typeof body.first_name === "string" ? body.first_name : "";
	const email = typeof body.email === "string" ? body.email : "";
	if (!firstName.trim() || !email.trim()) {
		return Response.json(
			{ error: "first_name and email are required" },
			{ status: 400 },
		);
	}
	const tags =
		Array.isArray(body.tags) && body.tags.every((t) => typeof t === "string")
			? (body.tags as string[])
			: undefined;
	const contact = await createContact(env.DB, {
		firstName: firstName.trim(),
		lastName:
			typeof body.last_name === "string" ? body.last_name : undefined,
		email: email.trim(),
		company: typeof body.company === "string" ? body.company : undefined,
		role: typeof body.role === "string" ? body.role : undefined,
		phone: typeof body.phone === "string" ? body.phone : undefined,
		linkedin: typeof body.linkedin === "string" ? body.linkedin : undefined,
		source: typeof body.source === "string" ? body.source : undefined,
		tags,
	});
	return Response.json(contact, { status: 201 });
}
