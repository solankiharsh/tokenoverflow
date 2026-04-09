import type { Route } from "./+types/api.admin.crm.stats";
import { requireAdmin } from "../lib/admin-auth";
import { loadContextKey } from "../lib/load-context";
import { getPipelineStats } from "../data/crm";

export async function loader(args: Route.LoaderArgs) {
	await requireAdmin(args);
	const env = args.context.get(loadContextKey).cloudflare.env as {
		DB: Parameters<typeof getPipelineStats>[0];
	};
	const stats = await getPipelineStats(env.DB);
	return Response.json(stats);
}
