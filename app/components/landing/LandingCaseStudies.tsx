import { Link } from "react-router";
import { SpotlightCard } from "./SpotlightCard";

const CASES = [
	{
		name: "WebinarForge",
		blurb: "End-to-end webinar automation — registration, reminders, and live ops wired into a coherent product story.",
		highlight: "Product + automation",
	},
	{
		name: "Pulse Engine",
		blurb: "Real-time signal and execution-adjacent infrastructure — reliability and observability first.",
		highlight: "Systems",
	},
	{
		name: "PPC attribution",
		blurb: "Attribution pipelines that reconcile spend, clicks, and outcomes — fewer spreadsheets, more decisions.",
		highlight: "Data & ML",
	},
];

export function LandingCaseStudies() {
	return (
		<section className="landing-section-muted py-20 sm:py-28 border-t border-volt-border">
			<div className="max-w-6xl mx-auto px-4">
				<p className="font-mono text-xs uppercase tracking-[0.28em] text-volt-purple mb-3">
					Selected work
				</p>
				<h2 className="landing-heading text-3xl sm:text-4xl text-volt-snow mb-12">
					Featured case studies
				</h2>
				<div className="grid md:grid-cols-3 gap-4 md:gap-5">
					{CASES.map((c) => (
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
					Detailed write-ups live under{" "}
					<Link to="/projects" className="text-volt-mint hover:text-volt-green transition-colors">
						Projects
					</Link>{" "}
					as they ship publicly.
				</p>
			</div>
		</section>
	);
}
