import { Link } from "react-router";
import type { Contact } from "../../db/schema";

interface ContactCardProps {
	contact: Contact;
}

const SOURCE_COLORS: Record<string, string> = {
	website: "bg-volt-carbon border border-volt-border text-volt-mint",
	newsletter: "bg-volt-carbon border border-volt-green/30 text-volt-green",
	referral: "bg-volt-carbon border border-volt-purple/40 text-volt-purple",
	linkedin: "bg-volt-carbon border border-volt-border text-volt-mist",
	event: "bg-volt-carbon border border-volt-border text-volt-parchment",
	manual: "bg-volt-carbon border border-volt-border text-volt-steel",
};

export function ContactCard({ contact }: ContactCardProps) {
	const tags: string[] = (() => {
		try {
			return JSON.parse(contact.tags ?? "[]");
		} catch {
			return [];
		}
	})();

	return (
		<Link
			to={`/admin/crm/contacts/${contact.id}`}
			className="comic-card p-4 block no-underline hover:shadow-lg transition-shadow"
		>
			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0">
					<p className="font-display font-bold text-volt-snow truncate">
						{contact.firstName} {contact.lastName ?? ""}
					</p>
					<p className="font-mono text-xs text-volt-steel truncate">
						{contact.email}
					</p>
					{contact.company && (
						<p className="text-sm text-volt-steel mt-0.5">
							{contact.company}
							{contact.role ? ` — ${contact.role}` : ""}
						</p>
					)}
				</div>
				<span
					className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${SOURCE_COLORS[contact.source] ?? SOURCE_COLORS.manual}`}
				>
					{contact.source.toUpperCase()}
				</span>
			</div>
			{tags.length > 0 && (
				<div className="flex flex-wrap gap-1 mt-2">
					{tags.map((tag) => (
						<span
							key={tag}
							className="font-mono text-xs border border-volt-border bg-volt-abyss text-volt-parchment px-1.5 py-0.5 rounded-md"
						>
							{tag}
						</span>
					))}
				</div>
			)}
		</Link>
	);
}
