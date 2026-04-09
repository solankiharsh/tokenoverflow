import { DealCard } from "./DealCard";
import type { DealWithContact } from "../../data/crm";

interface PipelineBoardProps {
	pipeline: Record<string, DealWithContact[]>;
}

const STAGES = [
	{ key: "lead", label: "Lead", color: "border-t-volt-steel" },
	{ key: "qualified", label: "Qualified", color: "border-t-volt-purple" },
	{ key: "proposal", label: "Proposal", color: "border-t-volt-mint" },
	{ key: "negotiation", label: "Negotiation", color: "border-t-volt-green" },
	{ key: "won", label: "Won", color: "border-t-emerald-400" },
	{ key: "lost", label: "Lost", color: "border-t-red-500" },
];

export function PipelineBoard({ pipeline }: PipelineBoardProps) {
	return (
		<div className="flex gap-4 overflow-x-auto pb-4">
			{STAGES.map(({ key, label, color }) => {
				const items = pipeline[key] ?? [];
				return (
					<div
						key={key}
						className={`min-w-[240px] shrink-0 rounded-lg bg-volt-carbon border border-volt-border border-t-4 ${color}`}
					>
						<div className="p-3 flex items-center justify-between">
							<h3 className="font-display font-bold text-sm text-volt-snow uppercase">
								{label}
							</h3>
							<span className="font-mono text-xs text-volt-steel bg-volt-carbon px-2 py-0.5 rounded-full border border-volt-border">
								{items.length}
							</span>
						</div>
						<div className="px-3 pb-3 space-y-2">
							{items.map((deal) => (
								<DealCard
									key={deal.id}
									deal={deal}
									currentStage={key}
								/>
							))}
							{items.length === 0 && (
								<p className="font-mono text-xs text-volt-steel text-center py-6">
									No deals
								</p>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}
