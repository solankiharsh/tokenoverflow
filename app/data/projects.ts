export interface Project {
	title: string;
	description: string;
	href: string | null;
	tech: string[];
}

export const projects: Project[] = [
	{
		title: "Cloak",
		description:
			"Invisible AI assistant for meetings and calls. Real-time transcription, call summaries, Google Calendar, knowledge base. Download for macOS.",
		href: "/cloak",
		tech: ["Tauri", "React", "AI"],
	},
	{
		title: "Deep Research AI Agent",
		description:
			"Autonomous due-diligence investigator. Enter a name — the agent runs multi-phase search, extracts entities, debates risk, and builds an identity graph. Live demo on Railway.",
		href: "https://ai-assessment-production-19d0.up.railway.app/",
		tech: ["LangGraph", "Python", "Next.js", "Neo4j", "AI"],
	},
	{
		title: "tokenoverflow",
		description: "This portfolio. React Router + Cloudflare Workers.",
		href: null,
		tech: ["React", "Cloudflare", "TypeScript"],
	},
];
