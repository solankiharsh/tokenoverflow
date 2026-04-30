import { Link } from "react-router";
import { SpotlightCard } from "./SpotlightCard";

const PRODUCTS = [
	{
		name: "WebinarForge",
		blurb: "Automated webinar operations stack across registration, reminders, follow-ups, and launch reporting.",
		highlight: "Automation SaaS",
	},
	{
		name: "Pulse Engine",
		blurb: "Real-time intelligence pipeline for signal processing and execution-adjacent automation.",
		highlight: "Trading Infrastructure",
	},
	{
		name: "Attribution Console",
		blurb: "Marketing intelligence surface that unifies spend, funnel events, and revenue signals in one view.",
		highlight: "Data Product",
	},
];

export function LandingCaseStudies() {
	return (
		<section className="landing-section-muted py-20 sm:py-28 border-t border-volt-border">
			<div className="max-w-6xl mx-auto px-4">
				<p className="font-mono text-xs uppercase tracking-[0.28em] text-volt-purple mb-3">
					Products
				</p>
				<h2 className="landing-heading text-3xl sm:text-4xl text-volt-snow mb-12">
					Built products
				</h2>
				<div className="grid md:grid-cols-3 gap-4 md:gap-5">
					{PRODUCTS.map((c) => (
						<SpotlightCard key={c.name} className="p-6 flex flex-col">
							<span className="font-mono text-[10px] uppercase tracking-wider text-volt-mint mb-3">
								{c.highlight}
							</span>
							<h3 className="landing-heading text-lg text-volt-snow mb-2">
								{c.name}
							</h3>
							<p className="text-sm text-volt-parchment leading-relaxed flex-1 relative z-10 tracking-wide">
								{c.blurb}
							</p>
						</SpotlightCard>
					))}
				</div>
				<p className="mt-8 text-sm text-volt-steel tracking-wide">
					More implementation detail lives under{" "}
					<Link to="/projects" className="text-volt-mint hover:text-volt-green transition-colors">
						Projects
					</Link>{" "}
					and expands as new products ship.
				</p>
			</div>
		</section>
	);
}
