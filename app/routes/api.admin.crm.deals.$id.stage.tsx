import type { Route } from "./+types/api.admin.crm.deals.$id.stage";
import { requireAdmin } from "../lib/admin-auth";
import { loadContextKey } from "../lib/load-context";
import { updateDealStage } from "../data/crm";

export async function action(args: Route.ActionArgs) {
	await requireAdmin(args);
	const { id } = args.params;
	if (!id) return Response.json({ error: "Bad request" }, { status: 400 });

	if (args.request.method !== "PATCH" && args.request.method !== "PUT") {
		return Response.json({ error: "Method not allowed" }, { status: 405 });
	}

	const env = args.context.get(loadContextKey).cloudflare.env as {
		DB: Parameters<typeof updateDealStage>[0];
	};
	const body = (await args.request.json()) as Record<string, unknown>;

	if (!body.stage || typeof body.stage !== "string") {
		return Response.json({ error: "stage is required" }, { status: 400 });
	}

	const validStages = [
		"lead",
		"qualified",
		"proposal",
		"negotiation",
		"won",
		"lost",
	];
	if (!validStages.includes(body.stage)) {
		return Response.json({ error: "Invalid stage" }, { status: 400 });
	}

	try {
		const result = await updateDealStage(
			env.DB,
			id,
			body.stage,
			typeof body.lost_reason === "string" ? body.lost_reason : undefined,
		);
		return Response.json(result);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : "Internal error";
		return Response.json({ error: msg }, { status: 404 });
	}
}

export function loader() {
	return Response.json({ error: "Method not allowed" }, { status: 405 });
}
