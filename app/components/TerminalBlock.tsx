import type { ReactNode } from "react";

interface TerminalBlockProps {
	children: ReactNode;
	className?: string;
	prompt?: string;
}

export function TerminalBlock({
	children,
	className = "",
	prompt = "$",
}: TerminalBlockProps) {
	return (
		<div
			className={`border border-volt-border bg-volt-carbon overflow-hidden ${className}`}
		>
			<div className="px-3 py-2 border-b border-volt-border font-mono text-xs text-volt-steel">
				{prompt}
			</div>
			<div className="p-4 font-mono text-sm text-volt-snow">
				{children}
			</div>
		</div>
	);
}
