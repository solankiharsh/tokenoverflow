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
			className={`border-[3px] border-comic-black bg-comic-gray overflow-hidden ${className}`}
		>
			<div className="px-3 py-2 border-b-[3px] border-comic-black font-mono text-xs text-comic-gray-medium">
				{prompt}
			</div>
			<div className="p-4 font-mono text-sm text-comic-black">
				{children}
			</div>
		</div>
	);
}
