import { Link } from "react-router";
import type { Route } from "./+types/admin.crm";
import { requireAdmin } from "../lib/admin-auth";
import { loadContextKey } from "../lib/load-context";
import {
	getPipelineStats,
	getContacts,
	getSubmissions,
} from "../data/crm";
import { StatsCards } from "../components/crm/StatsCards";
import { ContactCard } from "../components/crm/ContactCard";
import { buildMeta } from "../lib/seo";

function crmSchemaLikelyMissing(error: unknown): boolean {
	const parts: string[] = [];
	if (error instanceof Error) {
		parts.push(error.message);
		const c = error.cause;
		if (c instanceof Error) parts.push(c.message);
	}
	const msg = parts.join("\n");
	return (
		/no such table/i.test(msg) ||
		(/Failed query:/i.test(msg) && /form_submissions|contacts|deals/i.test(msg))
	);
}

export async function loader(args: Route.LoaderArgs) {
	await requireAdmin(args);
	const { cloudflare } = args.context.get(loadContextKey);
	const env = cloudflare.env as {
		DB: Parameters<typeof getPipelineStats>[0];
	};

	try {
		const [stats, recentContacts, recentSubmissions] = await Promise.all([
			getPipelineStats(env.DB),
			getContacts(env.DB, { limit: 10 }),
			getSubmissions(env.DB),
		]);
		return { stats, recentContacts, recentSubmissions };
	} catch (e) {
		if (crmSchemaLikelyMissing(e)) {
			throw new Error(
				"CRM tables are missing on D1. From the repo root run: npm run db:crm:remote " +
					"(or make db-crm-remote). Requires wrangler login; see README “D1 migrations”.",
			);
		}
		throw e;
	}
}

export function meta({ location }: Route.MetaArgs) {
	return buildMeta({
		title: "CRM | Admin",
		description: "Consultancy CRM dashboard.",
		path: location.pathname,
		noindex: true,
	});
}

export default function AdminCRM({ loaderData }: Route.ComponentProps) {
	const { stats, recentContacts, recentSubmissions } = loaderData;

	return (
		<div className="max-w-5xl mx-auto px-4 py-12">
			<div className="flex flex-wrap items-center justify-between gap-4 mb-6">
				<div>
					<Link
						to="/admin"
						className="font-display font-bold text-sm text-volt-steel hover:text-volt-green transition inline-block mb-2"
					>
						← ADMIN
					</Link>
					<h1 className="comic-heading text-2xl text-volt-snow">CRM</h1>
				</div>
				<div className="flex gap-2">
					<Link
						to="/admin/crm/pipeline"
						className="comic-btn text-sm py-2 px-4 no-underline"
					>
						PIPELINE
					</Link>
				</div>
			</div>

			<StatsCards
				pipeline={stats.pipeline}
				submissions30d={stats.submissions30d}
				conversionRate90d={stats.conversionRate90d}
			/>

			<div className="grid md:grid-cols-2 gap-8 mt-8">
				{/* Recent Contacts */}
				<section>
					<h2 className="font-display font-bold text-lg text-volt-snow mb-3">
						RECENT CONTACTS
					</h2>
					<div className="space-y-2">
						{recentContacts.map((contact) => (
							<ContactCard key={contact.id} contact={contact} />
						))}
						{recentContacts.length === 0 && (
							<p className="font-mono text-xs text-volt-steel">
								No contacts yet.
							</p>
						)}
					</div>
				</section>

				{/* Recent Submissions */}
				<section>
					<h2 className="font-display font-bold text-lg text-volt-snow mb-3">
						FORM SUBMISSIONS
					</h2>
					<div className="space-y-2">
						{recentSubmissions.map((sub) => (
							<div key={sub.id} className="comic-card p-3">
								<div className="flex items-center justify-between gap-2">
									<span className="font-display font-bold text-sm text-volt-snow">
										{sub.name || sub.email}
									</span>
									<span
										className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
											sub.status === "new"
												? "border-volt-mint/50 text-volt-mint bg-volt-carbon"
												: sub.status === "contacted"
													? "border-amber-500/40 text-amber-400 bg-volt-carbon"
													: sub.status === "converted"
														? "border-volt-green/50 text-volt-green bg-volt-carbon"
														: "border-volt-border text-volt-steel bg-volt-carbon"
										}`}
									>
										{sub.status.toUpperCase()}
									</span>
								</div>
								<p className="font-mono text-xs text-volt-steel">
									{sub.formType} — {sub.email}
								</p>
								{sub.message && (
									<p className="text-sm text-volt-steel mt-1 line-clamp-2">
										{sub.message}
									</p>
								)}
								<p className="font-mono text-xs text-volt-steel mt-1">
									{new Date(sub.createdAt).toLocaleDateString()}
								</p>
							</div>
						))}
						{recentSubmissions.length === 0 && (
							<p className="font-mono text-xs text-volt-steel">
								No submissions yet.
							</p>
						)}
					</div>
				</section>
			</div>
		</div>
	);
}
