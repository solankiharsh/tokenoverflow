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
		title: "NLP Sentiment Analysis (Finance)",
		description:
			"What makes a Finance Minister's speech stand out? Sentiment analysis on financial speeches using AI-NLP.",
		href: "https://github.com/solharsh/NLP_With_ML",
		tech: ["NLP", "ML", "Python"],
	},
	{
		title: "ML Reporting Tools",
		description: "Library of functions to generate visually pleasing reports for Machine Learning models.",
		href: "https://github.com/solankiharsh/ML-reporting-tools",
		tech: ["Python", "ML"],
	},
	{
		title: "fastapi_profiler",
		description: "FastAPI middleware (pyinstrument) to check your service performance.",
		href: "https://github.com/solankiharsh/fastapi_profiler",
		tech: ["FastAPI", "Python"],
	},
	{
		title: "basics",
		description: "Learn ML with clean code, simplified math and illustrative visuals.",
		href: "https://github.com/solankiharsh/basics",
		tech: ["Python", "ML"],
	},
	{
		title: "tokenoverflow",
		description: "This portfolio. React Router + Cloudflare Workers.",
		href: null,
		tech: ["React", "Cloudflare", "TypeScript"],
	},
];
