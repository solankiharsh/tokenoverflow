import { Link } from "react-router";
import type { Contact } from "../../db/schema";

interface ContactCardProps {
	contact: Contact;
}

const SOURCE_COLORS: Record<string, string> = {
	website: "bg-blue-100 text-blue-800",
	newsletter: "bg-green-100 text-green-800",
	referral: "bg-purple-100 text-purple-800",
	linkedin: "bg-sky-100 text-sky-800",
	event: "bg-orange-100 text-orange-800",
	manual: "bg-gray-100 text-gray-800",
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
					<p className="font-display font-bold text-comic-black truncate">
						{contact.firstName} {contact.lastName ?? ""}
					</p>
					<p className="font-mono text-xs text-comic-gray-medium truncate">
						{contact.email}
					</p>
					{contact.company && (
						<p className="text-sm text-comic-gray-medium mt-0.5">
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
							className="font-mono text-xs bg-comic-gray-light text-comic-gray-medium px-1.5 py-0.5 rounded"
						>
							{tag}
						</span>
					))}
				</div>
			)}
		</Link>
	);
}
