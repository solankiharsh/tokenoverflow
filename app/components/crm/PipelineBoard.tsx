import { DealCard } from "./DealCard";
import type { DealWithContact } from "../../data/crm";

interface PipelineBoardProps {
	pipeline: Record<string, DealWithContact[]>;
}

const STAGES = [
	{ key: "lead", label: "Lead", color: "border-blue-400" },
	{ key: "qualified", label: "Qualified", color: "border-yellow-400" },
	{ key: "proposal", label: "Proposal", color: "border-purple-400" },
	{ key: "negotiation", label: "Negotiation", color: "border-orange-400" },
	{ key: "won", label: "Won", color: "border-green-500" },
	{ key: "lost", label: "Lost", color: "border-red-400" },
];

export function PipelineBoard({ pipeline }: PipelineBoardProps) {
	return (
		<div className="flex gap-4 overflow-x-auto pb-4">
			{STAGES.map(({ key, label, color }) => {
				const items = pipeline[key] ?? [];
				return (
					<div
						key={key}
						className={`min-w-[240px] flex-shrink-0 border-t-4 ${color} bg-comic-gray-light/30 rounded-lg`}
					>
						<div className="p-3 flex items-center justify-between">
							<h3 className="font-display font-bold text-sm text-comic-black uppercase">
								{label}
							</h3>
							<span className="font-mono text-xs text-comic-gray-medium bg-comic-white px-2 py-0.5 rounded-full border border-comic-gray-light">
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
								<p className="font-mono text-xs text-comic-gray-medium text-center py-6">
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
