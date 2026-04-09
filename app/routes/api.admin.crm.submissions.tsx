import type { Route } from "./+types/api.admin.crm.submissions";
import { requireAdmin } from "../lib/admin-auth";
import { loadContextKey } from "../lib/load-context";
import { getSubmissions } from "../data/crm";

export async function loader(args: Route.LoaderArgs) {
	await requireAdmin(args);
	const env = args.context.get(loadContextKey).cloudflare.env as {
		DB: Parameters<typeof getSubmissions>[0];
	};

	const url = new URL(args.request.url);
	const status = url.searchParams.get("status") ?? undefined;
	const submissions = await getSubmissions(env.DB, status);
	return Response.json({ submissions });
}
