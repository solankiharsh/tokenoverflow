export interface Project {
	title: string;
	description: string;
	href: string | null;
	tech: string[];
}

export const projects: Project[] = [
	{
		title: "DerivArena",
		description:
			"Gamified trading competitions on the Deriv API. Sortino-ranked leaderboards, deployable AI trading agents, Deriv Miles + Marketplace, and a conversion engine that turns demo traders into depositors. Live: arena.solharsh.com.",
		href: "https://arena.solharsh.com",
		tech: ["Go", "Next.js", "PostgreSQL", "Deriv API", "AI"],
	},
	{
		title: "V-K Unit 2049",
		description:
			"A Blade Runner-inspired browser toy. Your webcam becomes a live cyberpunk ASCII readout and Gemini delivers a Nexus-style threat assessment in the voice of Deckard, Tyrell, Roy Batty, GLaDOS, HAL 9000, or SHODAN.",
		href: "/voight-kampff",
		tech: ["React", "Canvas", "Gemini", "Cloudflare Workers"],
	},
	{
		title: "Deep Research AI Agent",
		description:
			"Autonomous due-diligence investigator. Enter a name — the agent runs multi-phase search, extracts entities, debates risk, and builds an identity graph. Live demo on Render.",
		href: "https://ai-assessment-mcyx.onrender.com/",
		tech: ["LangGraph", "Python", "Next.js", "Neo4j", "AI"],
	},
	{
		title: "tokenoverflow",
		description: "This portfolio. React Router + Cloudflare Workers.",
		href: "https://github.com/solankiharsh/tokenoverflow",
		tech: ["React", "Cloudflare", "TypeScript"],
	},
	{
		title: "OpenClaw",
		description:
			"Multi-chain AI agent trading arena. Autonomous agents trade on Solana and BSC, earn on-chain rewards, real-time leaderboard and trade recommendations.",
		href: "https://openclaw-trading-d3yx.vercel.app/",
		tech: ["Bun", "Hono", "Next.js", "Solana", "PostgreSQL"],
	},
	{
		title: "Creative Forge",
		description:
			"Open-source AI design agent. Multimodal generation (images, video, designs), infinite canvas, template system, multi-provider support. Privacy-first.",
		href: "https://github.com/solankiharsh/creative-forge",
		tech: ["FastAPI", "React", "LangGraph", "Supabase", "Excalidraw"],
	},
];
