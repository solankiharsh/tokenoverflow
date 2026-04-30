import { SpotlightCard } from "./SpotlightCard";

const SERVICES = [
	{
		title: "AI Agent Development & Custom LLM Fine-tuning",
		desc: "Build domain-specific assistants and tuned models that map to real workflows, not demo prompts.",
		tag: "Capability",
	},
	{
		title: "Workflow Automation & Systems Integration",
		desc: "Connect siloed tools into dependable automations with clean handoffs, guardrails, and observability.",
		tag: "Capability",
	},
	{
		title: "Data Operations & Predictive Analytics",
		desc: "Turn fragmented events into decision-ready pipelines and forecasting surfaces teams can actually trust.",
		tag: "Capability",
	},
	{
		title: "Digital Infrastructure & Cloud AI Scaling",
		desc: "Ship production AI systems with secure infrastructure, resilient deploy paths, and performance controls.",
		tag: "Capability",
	},
];

export function LandingServices() {
	return (
		<section className="landing-section-dark py-20 sm:py-28 border-t border-volt-border">
			<div className="max-w-6xl mx-auto px-4">
				<p className="font-mono text-xs uppercase tracking-[0.28em] text-volt-mint mb-3">
					Services
				</p>
				<h2 className="landing-heading text-3xl sm:text-4xl text-volt-snow mb-4">
					Core capabilities
				</h2>
				<p className="text-volt-parchment max-w-2xl mb-12 leading-relaxed text-base tracking-wide">
					I combine deep technical execution with a senior-led engagement
					model so every AI build ships as a strategic business asset.
				</p>
				<div className="grid sm:grid-cols-2 gap-4 md:gap-5">
					{SERVICES.map((s) => (
						<SpotlightCard key={s.title} className="p-6 sm:p-8">
							<span className="inline-block font-mono text-[10px] uppercase tracking-wider text-volt-green mb-3">
								{s.tag}
							</span>
							<h3 className="landing-heading text-xl text-volt-snow mb-2">
								{s.title}
							</h3>
							<p className="text-sm text-volt-parchment leading-relaxed relative z-10 tracking-wide">
								{s.desc}
							</p>
						</SpotlightCard>
					))}
				</div>
			</div>
		</section>
	);
}
