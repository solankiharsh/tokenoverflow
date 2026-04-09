import { useFetcher, Link } from "react-router";
import type { DealWithContact } from "../../data/crm";

interface DealCardProps {
	deal: DealWithContact;
	currentStage: string;
}

const STAGE_ORDER = [
	"lead",
	"qualified",
	"proposal",
	"negotiation",
	"won",
	"lost",
] as const;

function formatCurrency(value: number | null, currency?: string | null): string {
	if (value == null) return "";
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency ?? "USD",
		maximumFractionDigits: 0,
	}).format(value);
}

export function DealCard({ deal, currentStage }: DealCardProps) {
	const fetcher = useFetcher();
	const currentIdx = STAGE_ORDER.indexOf(
		currentStage as (typeof STAGE_ORDER)[number],
	);

	const canAdvance =
		currentIdx >= 0 &&
		currentIdx < STAGE_ORDER.length - 2 &&
		currentStage !== "won" &&
		currentStage !== "lost";
	const nextStage = canAdvance ? STAGE_ORDER[currentIdx + 1] : null;

	function moveToStage(stage: string) {
		fetcher.submit(
			JSON.stringify({ stage }),
			{
				method: "PATCH",
				action: `/api/admin/crm/deals/${deal.id}/stage`,
				encType: "application/json",
			},
		);
	}

	return (
		<div className="comic-card p-3 space-y-2">
			<p className="font-display font-bold text-sm text-comic-black leading-tight">
				{deal.title}
			</p>
			<Link
				to={`/admin/crm/contacts/${deal.contactId}`}
				className="font-mono text-xs text-comic-gray-medium hover:text-comic-yellow transition no-underline block"
			>
				{deal.contactFirstName} {deal.contactLastName ?? ""}{" "}
				{deal.contactCompany ? `@ ${deal.contactCompany}` : ""}
			</Link>
			{deal.value != null && (
				<p className="font-display font-bold text-comic-black">
					{formatCurrency(deal.value, deal.currency)}
				</p>
			)}
			<div className="flex gap-1 flex-wrap pt-1">
				{nextStage && (
					<button
						type="button"
						className="comic-btn-outline text-xs py-1 px-2"
						disabled={fetcher.state !== "idle"}
						onClick={() => moveToStage(nextStage)}
					>
						→ {nextStage.toUpperCase()}
					</button>
				)}
				{currentStage !== "won" && currentStage !== "lost" && (
					<>
						<button
							type="button"
							className="text-xs font-bold text-green-700 hover:underline disabled:opacity-50"
							disabled={fetcher.state !== "idle"}
							onClick={() => moveToStage("won")}
						>
							WON
						</button>
						<button
							type="button"
							className="text-xs font-bold text-red-600 hover:underline disabled:opacity-50"
							disabled={fetcher.state !== "idle"}
							onClick={() => moveToStage("lost")}
						>
							LOST
						</button>
					</>
				)}
			</div>
		</div>
	);
}
