export interface ExtracurricularItem {
	/** Short title, e.g. talk or event name */
	title: string;
	/** Optional longer description */
	description?: string;
	/** Image path in public/ (e.g. /harsh-solanki-speaker-autonomous-ai-systems.png) */
	image?: string;
	/** Optional: YouTube or Vimeo URL — will be embedded. Add when you have a recording. */
	videoUrl?: string;
	/** Optional: human-readable date or event timing */
	date?: string;
	/** Optional: link to event page or recap */
	href?: string;
}

export const extracurriculars: ExtracurricularItem[] = [
	{
		title: "Speaker: Autonomous AI Systems",
		description:
			"Spoke at the lablab.ai × Deriv event on autonomous AI systems. @lablabai & @Derivdotcom on X and LinkedIn.",
		image: "/harsh-solanki-speaker-autonomous-ai-systems.png",
		// videoUrl: "https://www.youtube.com/watch?v=…", // add when you have the recording
		date: "Wed, Jan 21st · 3:00 PM CET / 6:00 PM GST",
		href: "https://x.com/lablabai",
	},
	// Add more items (talks, workshops, podcasts) — each can have image and/or videoUrl.
];
