import type { Route } from "./+types/api.admin.crm.deals";
import { requireAdmin } from "../lib/admin-auth";
import { loadContextKey } from "../lib/load-context";
import { createDeal } from "../data/crm";

export async function action(args: Route.ActionArgs) {
	await requireAdmin(args);
	if (args.request.method !== "POST") {
		return Response.json({ error: "Method not allowed" }, { status: 405 });
	}

	const env = args.context.get(loadContextKey).cloudflare.env as {
		DB: Parameters<typeof createDeal>[0];
	};
	const body = (await args.request.json()) as Record<string, unknown>;

	if (!body.contact_id || !body.title) {
		return Response.json(
			{ error: "contact_id and title are required" },
			{ status: 400 },
		);
	}

	const deal = await createDeal(env.DB, {
		contactId: body.contact_id as string,
		title: body.title as string,
		stage: (body.stage as string) ?? undefined,
		value: typeof body.value === "number" ? body.value : undefined,
		currency: (body.currency as string) ?? undefined,
		description: (body.description as string) ?? undefined,
		expectedClose: (body.expected_close as string) ?? undefined,
	});
	return Response.json(deal, { status: 201 });
}

export function loader() {
	return Response.json({ error: "Method not allowed" }, { status: 405 });
}
