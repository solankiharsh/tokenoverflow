interface StatsCardsProps {
	pipeline: Array<{
		stage: string;
		count: number;
		totalValue: number;
		avgValue: number;
	}>;
	submissions30d: number;
	conversionRate90d: string;
}

const STAGE_LABELS: Record<string, string> = {
	lead: "Leads",
	qualified: "Qualified",
	proposal: "Proposal",
	negotiation: "Negotiation",
	won: "Won",
	lost: "Lost",
};

function formatCurrency(value: number): string {
	if (value === 0) return "$0";
	if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
	return `$${value.toFixed(0)}`;
}

export function StatsCards({
	pipeline,
	submissions30d,
	conversionRate90d,
}: StatsCardsProps) {
	const totalDeals = pipeline.reduce((acc, s) => acc + s.count, 0);
	const totalValue = pipeline.reduce((acc, s) => acc + s.totalValue, 0);
	const activeDeals = pipeline
		.filter((s) => !["won", "lost"].includes(s.stage))
		.reduce((acc, s) => acc + s.count, 0);

	const cards = [
		{ label: "ACTIVE DEALS", value: String(activeDeals) },
		{ label: "TOTAL PIPELINE", value: formatCurrency(totalValue) },
		{ label: "SUBMISSIONS (30D)", value: String(submissions30d) },
		{ label: "WIN RATE (90D)", value: `${conversionRate90d}%` },
	];

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
			{cards.map((card) => (
				<div key={card.label} className="comic-card p-4 text-center">
					<p className="font-mono text-xs text-comic-gray-medium">
						{card.label}
					</p>
					<p className="font-display font-bold text-2xl text-comic-black mt-1">
						{card.value}
					</p>
				</div>
			))}
			{pipeline.map((stage) => (
				<div key={stage.stage} className="comic-card p-3 text-center">
					<p className="font-mono text-xs text-comic-gray-medium uppercase">
						{STAGE_LABELS[stage.stage] ?? stage.stage}
					</p>
					<p className="font-display font-bold text-lg text-comic-black">
						{stage.count}
					</p>
					<p className="font-mono text-xs text-comic-gray-medium">
						{formatCurrency(stage.totalValue)}
					</p>
				</div>
			))}
		</div>
	);
}
