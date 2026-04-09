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

export async function loader(args: Route.LoaderArgs) {
	await requireAdmin(args);
	const { cloudflare } = args.context.get(loadContextKey);
	const env = cloudflare.env as {
		DB: Parameters<typeof getPipelineStats>[0];
	};

	const [stats, recentContacts, recentSubmissions] = await Promise.all([
		getPipelineStats(env.DB),
		getContacts(env.DB, { limit: 10 }),
		getSubmissions(env.DB),
	]);

	return { stats, recentContacts, recentSubmissions };
}

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "CRM | Admin | Harsh Solanki" },
		{ name: "description", content: "Consultancy CRM dashboard." },
	];
}

export default function AdminCRM({ loaderData }: Route.ComponentProps) {
	const { stats, recentContacts, recentSubmissions } = loaderData;

	return (
		<div className="max-w-5xl mx-auto px-4 py-12">
			<div className="flex flex-wrap items-center justify-between gap-4 mb-6">
				<div>
					<Link
						to="/admin"
						className="font-display font-bold text-sm text-comic-gray-medium hover:text-comic-yellow transition inline-block mb-2"
					>
						← ADMIN
					</Link>
					<h1 className="comic-heading text-2xl text-comic-black">CRM</h1>
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
					<h2 className="font-display font-bold text-lg text-comic-black mb-3">
						RECENT CONTACTS
					</h2>
					<div className="space-y-2">
						{recentContacts.map((contact) => (
							<ContactCard key={contact.id} contact={contact} />
						))}
						{recentContacts.length === 0 && (
							<p className="font-mono text-xs text-comic-gray-medium">
								No contacts yet.
							</p>
						)}
					</div>
				</section>

				{/* Recent Submissions */}
				<section>
					<h2 className="font-display font-bold text-lg text-comic-black mb-3">
						FORM SUBMISSIONS
					</h2>
					<div className="space-y-2">
						{recentSubmissions.map((sub) => (
							<div key={sub.id} className="comic-card p-3">
								<div className="flex items-center justify-between gap-2">
									<span className="font-display font-bold text-sm text-comic-black">
										{sub.name || sub.email}
									</span>
									<span
										className={`text-xs font-bold px-2 py-0.5 rounded-full ${
											sub.status === "new"
												? "bg-blue-100 text-blue-800"
												: sub.status === "contacted"
													? "bg-yellow-100 text-yellow-800"
													: sub.status === "converted"
														? "bg-green-100 text-green-800"
														: "bg-gray-100 text-gray-800"
										}`}
									>
										{sub.status.toUpperCase()}
									</span>
								</div>
								<p className="font-mono text-xs text-comic-gray-medium">
									{sub.formType} — {sub.email}
								</p>
								{sub.message && (
									<p className="text-sm text-comic-gray-medium mt-1 line-clamp-2">
										{sub.message}
									</p>
								)}
								<p className="font-mono text-xs text-comic-gray-medium mt-1">
									{new Date(sub.createdAt).toLocaleDateString()}
								</p>
							</div>
						))}
						{recentSubmissions.length === 0 && (
							<p className="font-mono text-xs text-comic-gray-medium">
								No submissions yet.
							</p>
						)}
					</div>
				</section>
			</div>
		</div>
	);
}
