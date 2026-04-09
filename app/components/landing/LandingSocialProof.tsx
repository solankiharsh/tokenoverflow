export function LandingSocialProof() {
	return (
		<section className="landing-section-dark py-14 sm:py-16 border-t border-white/[0.06]">
			<div className="max-w-6xl mx-auto px-4">
				<p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 text-center mb-10">
					Trusted in production
				</p>
				<div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
					<div className="flex items-center gap-4">
						<div className="h-12 w-32 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center">
							<span className="landing-heading text-lg text-white tracking-tight">
								Deriv
							</span>
						</div>
						<p className="text-sm text-zinc-500 max-w-xs">
							Engineering Lead, Applied AI — shipping systems used at scale.
						</p>
					</div>
					<div className="flex gap-4">
						<div className="w-28 h-20 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 border border-white/10 flex items-center justify-center">
							<span className="font-mono text-[10px] text-zinc-400 text-center px-2">
								Dubai
								<br />
								workshop
							</span>
						</div>
						<div className="w-28 h-20 rounded-xl bg-gradient-to-br from-fuchsia-500/15 to-violet-500/10 border border-white/10 flex items-center justify-center">
							<span className="font-mono text-[10px] text-zinc-400 text-center px-2">
								Jordan
								<br />
								session
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
