import { Link } from "react-router";

const bookingUrl =
	(typeof import.meta !== "undefined" &&
		(import.meta.env.VITE_BOOKING_URL as string | undefined)) ||
	"https://www.linkedin.com/in/solankiharsh/";

export function LandingHero() {
	return (
		<section className="relative min-h-[88vh] flex flex-col justify-center mesh-hero-bg overflow-hidden">
			<div
				className="landing-grid-overlay absolute inset-0 pointer-events-none opacity-80"
				aria-hidden
			/>
			<div
				className="absolute inset-0 opacity-25 pointer-events-none"
				aria-hidden
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300d992' fill-opacity='0.07'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
				}}
			/>

			<div className="relative z-10 max-w-5xl mx-auto px-4 pt-28 pb-20 sm:pt-32 sm:pb-28">
				<p className="landing-animate-in font-mono text-xs uppercase tracking-[0.28em] text-volt-mint mb-6">
					Principal · Applied AI &amp; systems
				</p>
				<h1 className="landing-animate-in landing-animate-delay-1 text-4xl sm:text-5xl md:text-6xl lg:text-[3.75rem] text-volt-snow mb-6 leading-[1.05] tracking-[-0.04em] font-normal">
					I architect{" "}
					<span className="landing-glow-text">production AI systems</span> —
					agents, trading engines, MLOps.
				</h1>
				<p className="landing-animate-in landing-animate-delay-2 text-lg sm:text-xl text-volt-parchment max-w-2xl leading-relaxed mb-10 tracking-wide">
					Engineering Lead, Applied AI at Deriv. From multi-agent pipelines
					to algorithmic trading engines — four years before that inside
					Target's ML Platform (feature store, Kernels-as-a-Service, MLflow).
					Fractional CTO / technical sparring partner for teams that need
					rigor, not slide decks.
				</p>
				<div className="landing-animate-in landing-animate-delay-3 flex flex-wrap gap-3">
					<a
						href={bookingUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="comic-btn px-6 py-3.5 text-sm"
					>
						Book a strategy call
					</a>
					<Link
						to="/projects"
						className="comic-btn-outline px-6 py-3.5 text-sm no-underline inline-flex items-center justify-center"
					>
						View selected work
					</Link>
					<a
						href="/resume.pdf"
						download="Harsh-Solanki-AI-Leader.pdf"
						className="comic-btn-outline px-6 py-3.5 text-sm no-underline inline-flex items-center justify-center"
					>
						Download resume
					</a>
					<Link
						to="/blog"
						className="inline-flex items-center justify-center px-4 py-3.5 text-sm text-volt-steel hover:text-volt-mint transition-colors no-underline"
					>
						Latest writing →
					</Link>
				</div>
			</div>
		</section>
	);
}
