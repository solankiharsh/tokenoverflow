import { Link } from "react-router";
import type { Route } from "./+types/admin.crm.pipeline";
import { requireAdmin } from "../lib/admin-auth";
import { loadContextKey } from "../lib/load-context";
import { getDealsPipeline } from "../data/crm";
import { PipelineBoard } from "../components/crm/PipelineBoard";

export async function loader(args: Route.LoaderArgs) {
	await requireAdmin(args);
	const { cloudflare } = args.context.get(loadContextKey);
	const env = cloudflare.env as {
		DB: Parameters<typeof getDealsPipeline>[0];
	};
	const pipeline = await getDealsPipeline(env.DB);
	return { pipeline };
}

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Pipeline | CRM | Admin | Harsh Solanki" },
		{ name: "description", content: "Deal pipeline kanban board." },
	];
}

export default function AdminCRMPipeline({ loaderData }: Route.ComponentProps) {
	const { pipeline } = loaderData;

	return (
		<div className="max-w-full mx-auto px-4 py-12">
			<div className="flex flex-wrap items-center justify-between gap-4 mb-6">
				<div>
					<Link
						to="/admin/crm"
						className="font-display font-bold text-sm text-comic-gray-medium hover:text-comic-yellow transition inline-block mb-2"
					>
						← CRM
					</Link>
					<h1 className="comic-heading text-2xl text-comic-black">
						PIPELINE
					</h1>
				</div>
			</div>

			<PipelineBoard pipeline={pipeline} />
		</div>
	);
}
