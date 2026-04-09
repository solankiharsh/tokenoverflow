const bookingUrl =
	(typeof import.meta !== "undefined" &&
		(import.meta.env.VITE_BOOKING_URL as string | undefined)) ||
	"https://www.linkedin.com/in/solankiharsh/";

export function LandingCta() {
	return (
		<section className="relative py-24 sm:py-32 overflow-hidden border-t border-white/[0.06]">
			<div
				className="absolute inset-0 mesh-hero-bg opacity-90"
				aria-hidden
			/>
			<div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
				<h2 className="landing-heading text-3xl sm:text-4xl text-white mb-4">
					Have a hard problem worth solving?
				</h2>
				<p className="text-zinc-400 mb-8 leading-relaxed">
					Tell me about the outcome you need — multi-agent systems, trading
					infra, or getting AI out of the lab. I take a small number of
					engagements each quarter.
				</p>
				<a
					href={bookingUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center justify-center rounded-xl bg-white text-zinc-950 font-semibold px-8 py-4 text-sm hover:bg-zinc-200 transition-colors"
				>
					Book a call
				</a>
			</div>
		</section>
	);
}
