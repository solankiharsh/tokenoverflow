import { Link } from "react-router";

const bookingUrl =
	(typeof import.meta !== "undefined" &&
		(import.meta.env.VITE_BOOKING_URL as string | undefined)) ||
	"https://www.linkedin.com/in/solankiharsh/";

export function LandingHero() {
	return (
		<section className="relative min-h-[88vh] flex flex-col justify-center mesh-hero-bg overflow-hidden">
			<div
				className="landing-grid-overlay absolute inset-0 pointer-events-none"
				aria-hidden
			/>
			<div
				className="absolute inset-0 opacity-[0.35] pointer-events-none"
				aria-hidden
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
				}}
			/>

			<div className="relative z-10 max-w-5xl mx-auto px-4 pt-28 pb-20 sm:pt-32 sm:pb-28">
				<p className="landing-animate-in font-mono text-xs uppercase tracking-[0.2em] text-cyan-400/90 mb-6">
					Principal · Applied AI &amp; systems
				</p>
				<h1 className="landing-animate-in landing-animate-delay-1 landing-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mb-6">
					I architect{" "}
					<span className="landing-glow-text">production AI systems</span>{" "}
					that ship — from multi-agent pipelines to algorithmic trading
					engines.
				</h1>
				<p className="landing-animate-in landing-animate-delay-2 text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed mb-10">
					Engineering Lead, Applied AI at Deriv. Fractional CTO / technical
					sparring partner for teams that need rigor, not slide decks.
				</p>
				<div className="landing-animate-in landing-animate-delay-3 flex flex-wrap gap-3">
					<a
						href={bookingUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center justify-center rounded-xl bg-white text-zinc-950 font-semibold px-6 py-3.5 text-sm hover:bg-zinc-200 transition-colors"
					>
						Book a strategy call
					</a>
					<Link
						to="/projects"
						className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white px-6 py-3.5 text-sm font-medium hover:bg-white/10 transition-colors no-underline"
					>
						View selected work
					</Link>
					<Link
						to="/blog"
						className="inline-flex items-center justify-center rounded-xl border border-transparent text-zinc-400 px-4 py-3.5 text-sm hover:text-white transition-colors no-underline"
					>
						Latest writing →
					</Link>
				</div>
			</div>
		</section>
	);
}
