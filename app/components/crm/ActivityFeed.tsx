import type { Activity } from "../../db/schema";

interface ActivityFeedProps {
	activities: Activity[];
}

const TYPE_STYLES: Record<string, { icon: string; label: string }> = {
	note: { icon: "📝", label: "Note" },
	email: { icon: "📧", label: "Email" },
	call: { icon: "📞", label: "Call" },
	meeting: { icon: "🤝", label: "Meeting" },
	form_submission: { icon: "📋", label: "Form" },
	booking: { icon: "📅", label: "Booking" },
};

function timeAgo(iso: string): string {
	const diff = Date.now() - new Date(iso).getTime();
	const mins = Math.floor(diff / 60_000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d ago`;
	return new Date(iso).toLocaleDateString();
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
	if (activities.length === 0) {
		return (
			<p className="font-mono text-xs text-volt-steel text-center py-4">
				No activities yet.
			</p>
		);
	}

	return (
		<div className="space-y-3">
			{activities.map((activity) => {
				const style = TYPE_STYLES[activity.type] ?? {
					icon: "•",
					label: activity.type,
				};
				return (
					<div key={activity.id} className="flex gap-3 items-start">
						<span className="text-lg leading-none mt-0.5" aria-hidden>
							{style.icon}
						</span>
						<div className="min-w-0 flex-1">
							<div className="flex items-baseline gap-2">
								<span className="font-display font-bold text-sm text-volt-snow">
									{activity.title}
								</span>
								<span className="font-mono text-xs text-volt-steel shrink-0">
									{timeAgo(activity.createdAt)}
								</span>
							</div>
							{activity.body && (
								<p className="text-sm text-volt-steel mt-0.5 line-clamp-2">
									{activity.body}
								</p>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}
