import { SpotlightCard } from "./SpotlightCard";

const SERVICES = [
	{
		title: "Multi-agent & orchestration",
		desc: "Design and ship agentic workflows, tool use, evals, and guardrails that survive real traffic.",
		tag: "Agents",
	},
	{
		title: "Trading & quant-adjacent systems",
		desc: "Low-latency pipelines, signal research infra, and risk-aware automation — not toy backtests.",
		tag: "Systems",
	},
	{
		title: "AI product & platform",
		desc: "From RAG that actually works to observability, cost controls, and CI for models in production.",
		tag: "Platform",
	},
	{
		title: "Team lift & architecture reviews",
		desc: "Hands-on pairing, ADRs, and pragmatic roadmaps so your team owns the stack after I leave.",
		tag: "Leadership",
	},
];

export function LandingServices() {
	return (
		<section className="landing-section-dark py-20 sm:py-28 border-t border-white/[0.06]">
			<div className="max-w-6xl mx-auto px-4">
				<p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400 mb-3">
					Services
				</p>
				<h2 className="landing-heading text-3xl sm:text-4xl text-white mb-4">
					How I work with teams
				</h2>
				<p className="text-zinc-400 max-w-2xl mb-12 leading-relaxed">
					Focused engagements: ship the hard parts, document the rest, and
					leave you with systems you can operate.
				</p>
				<div className="grid sm:grid-cols-2 gap-4 md:gap-5">
					{SERVICES.map((s) => (
						<SpotlightCard key={s.title} className="p-6 sm:p-8">
							<span className="inline-block font-mono text-[10px] uppercase tracking-wider text-cyan-400/90 mb-3">
								{s.tag}
							</span>
							<h3 className="landing-heading text-xl text-white mb-2">
								{s.title}
							</h3>
							<p className="text-sm text-zinc-400 leading-relaxed relative z-10">
								{s.desc}
							</p>
						</SpotlightCard>
					))}
				</div>
			</div>
		</section>
	);
}
