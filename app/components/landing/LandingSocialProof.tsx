export function LandingSocialProof() {
	return (
		<section className="landing-section-dark py-14 sm:py-16 border-t border-volt-border">
			<div className="max-w-6xl mx-auto px-4">
				<p className="font-mono text-xs uppercase tracking-[0.28em] text-volt-steel text-center mb-10">
					Trusted in production
				</p>
				<div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
					<div className="flex items-center gap-4">
						<div className="h-12 w-32 rounded-lg bg-volt-carbon border border-volt-border flex items-center justify-center shadow-[0_0_15px_rgba(92,88,85,0.2)]">
							<span className="text-lg text-volt-snow tracking-tight font-medium">
								Deriv
							</span>
						</div>
						<p className="text-sm text-volt-parchment max-w-xs tracking-wide">
							Engineering Lead, Applied AI — shipping systems used at scale.
						</p>
					</div>
					<div className="flex gap-4">
						<div className="w-28 h-20 rounded-lg bg-volt-carbon border border-dashed border-[rgba(79,93,117,0.4)] flex items-center justify-center">
							<span className="font-mono text-[10px] text-volt-steel text-center px-2">
								Dubai
								<br />
								workshop
							</span>
						</div>
						<div className="w-28 h-20 rounded-lg bg-volt-carbon border border-dashed border-[rgba(79,93,117,0.4)] flex items-center justify-center">
							<span className="font-mono text-[10px] text-volt-steel text-center px-2">
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
