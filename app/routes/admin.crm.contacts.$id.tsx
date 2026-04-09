import { Link, useFetcher } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/admin.crm.contacts.$id";
import { requireAdmin } from "../lib/admin-auth";
import { loadContextKey } from "../lib/load-context";
import { getContact } from "../data/crm";
import { ActivityFeed } from "../components/crm/ActivityFeed";

export async function loader(args: Route.LoaderArgs) {
	await requireAdmin(args);
	const { id } = args.params;
	if (!id) throw new Response("Bad request", { status: 400 });

	const { cloudflare } = args.context.get(loadContextKey);
	const env = cloudflare.env as {
		DB: Parameters<typeof getContact>[0];
	};
	const contact = await getContact(env.DB, id);
	if (!contact) throw new Response("Not found", { status: 404 });
	return { contact };
}

export function meta({ data }: Route.MetaArgs) {
	const name = data?.contact
		? `${data.contact.firstName} ${data.contact.lastName ?? ""}`
		: "Contact";
	return [
		{ title: `${name} | CRM | Admin` },
		{ name: "description", content: `Contact detail for ${name}.` },
	];
}

const STAGE_COLORS: Record<string, string> = {
	lead: "bg-blue-100 text-blue-800",
	qualified: "bg-yellow-100 text-yellow-800",
	proposal: "bg-purple-100 text-purple-800",
	negotiation: "bg-orange-100 text-orange-800",
	won: "bg-green-100 text-green-800",
	lost: "bg-red-100 text-red-800",
};

export default function AdminCRMContactDetail({
	loaderData,
}: Route.ComponentProps) {
	const { contact } = loaderData;
	const noteFetcher = useFetcher();
	const [noteTitle, setNoteTitle] = useState("");
	const [noteBody, setNoteBody] = useState("");

	const tags: string[] = (() => {
		try {
			return JSON.parse(contact.tags ?? "[]");
		} catch {
			return [];
		}
	})();

	function submitNote(e: React.FormEvent) {
		e.preventDefault();
		if (!noteTitle.trim()) return;
		noteFetcher.submit(
			JSON.stringify({
				contact_id: contact.id,
				type: "note",
				title: noteTitle.trim(),
				body: noteBody.trim() || undefined,
			}),
			{
				method: "POST",
				action: "/api/admin/crm/activities",
				encType: "application/json",
			},
		);
		setNoteTitle("");
		setNoteBody("");
	}

	return (
		<div className="max-w-3xl mx-auto px-4 py-12">
			<Link
				to="/admin/crm"
				className="font-display font-bold text-sm text-comic-gray-medium hover:text-comic-yellow transition inline-block mb-6"
			>
				← CRM
			</Link>

			{/* Contact Header */}
			<div className="comic-card p-6 mb-6">
				<h1 className="comic-heading text-2xl text-comic-black">
					{contact.firstName} {contact.lastName ?? ""}
				</h1>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
					<p className="font-mono text-sm">
						<span className="text-comic-gray-medium">Email: </span>
						<a
							href={`mailto:${contact.email}`}
							className="text-comic-black hover:text-comic-yellow transition"
						>
							{contact.email}
						</a>
					</p>
					{contact.company && (
						<p className="font-mono text-sm">
							<span className="text-comic-gray-medium">Company: </span>
							<span className="text-comic-black">{contact.company}</span>
						</p>
					)}
					{contact.role && (
						<p className="font-mono text-sm">
							<span className="text-comic-gray-medium">Role: </span>
							<span className="text-comic-black">{contact.role}</span>
						</p>
					)}
					{contact.phone && (
						<p className="font-mono text-sm">
							<span className="text-comic-gray-medium">Phone: </span>
							<span className="text-comic-black">{contact.phone}</span>
						</p>
					)}
					{contact.linkedin && (
						<p className="font-mono text-sm">
							<span className="text-comic-gray-medium">LinkedIn: </span>
							<a
								href={contact.linkedin}
								target="_blank"
								rel="noopener noreferrer"
								className="text-comic-black hover:text-comic-yellow transition"
							>
								Profile
							</a>
						</p>
					)}
					<p className="font-mono text-sm">
						<span className="text-comic-gray-medium">Source: </span>
						<span className="text-comic-black">{contact.source}</span>
					</p>
				</div>
				{tags.length > 0 && (
					<div className="flex flex-wrap gap-1 mt-3">
						{tags.map((tag) => (
							<span
								key={tag}
								className="font-mono text-xs bg-comic-gray-light text-comic-gray-medium px-2 py-0.5 rounded"
							>
								{tag}
							</span>
						))}
					</div>
				)}
				<p className="font-mono text-xs text-comic-gray-medium mt-3">
					Contact since{" "}
					{new Date(contact.createdAt).toLocaleDateString()}
				</p>
			</div>

			{/* Deals */}
			<section className="mb-8">
				<h2 className="font-display font-bold text-lg text-comic-black mb-3">
					DEALS
				</h2>
				{contact.deals.length > 0 ? (
					<div className="space-y-2">
						{contact.deals.map((deal) => (
							<div
								key={deal.id}
								className="comic-card p-4 flex flex-wrap items-center justify-between gap-2"
							>
								<div>
									<span className="font-display font-bold text-comic-black">
										{deal.title}
									</span>
									{deal.value != null && (
										<span className="font-mono text-sm text-comic-gray-medium ml-2">
											{new Intl.NumberFormat("en-US", {
												style: "currency",
												currency: deal.currency ?? "USD",
												maximumFractionDigits: 0,
											}).format(deal.value)}
										</span>
									)}
								</div>
								<span
									className={`text-xs font-bold px-2 py-0.5 rounded-full ${STAGE_COLORS[deal.stage] ?? "bg-gray-100 text-gray-800"}`}
								>
									{deal.stage.toUpperCase()}
								</span>
							</div>
						))}
					</div>
				) : (
					<p className="font-mono text-xs text-comic-gray-medium">
						No deals yet.
					</p>
				)}
			</section>

			{/* Add Note */}
			<section className="mb-8">
				<h2 className="font-display font-bold text-lg text-comic-black mb-3">
					ADD NOTE
				</h2>
				<form onSubmit={submitNote} className="comic-card p-4 space-y-3">
					<input
						type="text"
						value={noteTitle}
						onChange={(e) => setNoteTitle(e.target.value)}
						placeholder="Note title..."
						className="w-full border-2 border-comic-black rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-comic-yellow"
						required
					/>
					<textarea
						value={noteBody}
						onChange={(e) => setNoteBody(e.target.value)}
						placeholder="Details (optional)..."
						rows={3}
						className="w-full border-2 border-comic-black rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-comic-yellow resize-y"
					/>
					<button
						type="submit"
						className="comic-btn text-sm py-2 px-4"
						disabled={noteFetcher.state !== "idle"}
					>
						{noteFetcher.state !== "idle" ? "SAVING..." : "ADD NOTE"}
					</button>
				</form>
			</section>

			{/* Activity Feed */}
			<section>
				<h2 className="font-display font-bold text-lg text-comic-black mb-3">
					ACTIVITY
				</h2>
				<ActivityFeed activities={contact.activities} />
			</section>
		</div>
	);
}
