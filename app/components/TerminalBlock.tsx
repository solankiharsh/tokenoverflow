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
			className={`rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] overflow-hidden ${className}`}
		>
			<div className="px-3 py-2 border-b border-[var(--terminal-border)] font-mono text-xs text-[var(--terminal-text-muted)]">
				{prompt}
			</div>
			<div className="p-4 font-mono text-sm text-[var(--terminal-text)]">
				{children}
			</div>
		</div>
	);
}
