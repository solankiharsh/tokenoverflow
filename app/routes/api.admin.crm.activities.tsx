import type { Route } from "./+types/api.admin.crm.activities";
import { requireAdmin } from "../lib/admin-auth";
import { loadContextKey } from "../lib/load-context";
import { logActivity } from "../data/crm";

export async function action(args: Route.ActionArgs) {
	await requireAdmin(args);
	if (args.request.method !== "POST") {
		return Response.json({ error: "Method not allowed" }, { status: 405 });
	}

	const env = args.context.get(loadContextKey).cloudflare.env as {
		DB: Parameters<typeof logActivity>[0];
	};
	const body = (await args.request.json()) as Record<string, unknown>;

	if (!body.type || !body.title) {
		return Response.json(
			{ error: "type and title are required" },
			{ status: 400 },
		);
	}

	const activity = await logActivity(env.DB, {
		contactId: typeof body.contact_id === "string" ? body.contact_id : undefined,
		dealId: typeof body.deal_id === "string" ? body.deal_id : undefined,
		type: body.type as string,
		title: body.title as string,
		body: typeof body.body === "string" ? body.body : undefined,
		metadata:
			body.metadata && typeof body.metadata === "object"
				? (body.metadata as Record<string, unknown>)
				: undefined,
	});
	return Response.json(activity, { status: 201 });
}

export function loader() {
	return Response.json({ error: "Method not allowed" }, { status: 405 });
}
