import type { Route } from "./+types/api.admin.crm.contacts.$id";
import { requireAdmin } from "../lib/admin-auth";
import { loadContextKey } from "../lib/load-context";
import { getContact, updateContact, deleteContact } from "../data/crm";

export async function loader(args: Route.LoaderArgs) {
	await requireAdmin(args);
	const { id } = args.params;
	if (!id) return Response.json({ error: "Bad request" }, { status: 400 });

	const env = args.context.get(loadContextKey).cloudflare.env as {
		DB: Parameters<typeof getContact>[0];
	};
	const contact = await getContact(env.DB, id);
	if (!contact) {
		return Response.json({ error: "Contact not found" }, { status: 404 });
	}
	return Response.json(contact);
}

export async function action(args: Route.ActionArgs) {
	await requireAdmin(args);
	const { id } = args.params;
	if (!id) return Response.json({ error: "Bad request" }, { status: 400 });

	const env = args.context.get(loadContextKey).cloudflare.env as {
		DB: Parameters<typeof updateContact>[0];
	};

	if (args.request.method === "DELETE") {
		await deleteContact(env.DB, id);
		return Response.json({ ok: true });
	}

	if (args.request.method === "PUT" || args.request.method === "PATCH") {
		const body = (await args.request.json()) as Record<string, unknown>;
		const updated = await updateContact(env.DB, id, {
			firstName: body.first_name as string | undefined,
			lastName: body.last_name as string | undefined,
			company: body.company as string | undefined,
			role: body.role as string | undefined,
			phone: body.phone as string | undefined,
			linkedin: body.linkedin as string | undefined,
			source: body.source as string | undefined,
			tags: body.tags as string[] | undefined,
		});
		if (!updated) {
			return Response.json({ error: "Contact not found" }, { status: 404 });
		}
		return Response.json(updated);
	}

	return Response.json({ error: "Method not allowed" }, { status: 405 });
}
