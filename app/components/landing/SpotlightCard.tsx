import { useCallback, useRef, type ReactNode } from "react";

export function SpotlightCard({
	children,
	className = "",
}: {
	children: ReactNode;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);

	const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		const el = ref.current;
		if (!el) return;
		const r = el.getBoundingClientRect();
		const x = ((e.clientX - r.left) / r.width) * 100;
		const y = ((e.clientY - r.top) / r.height) * 100;
		el.style.setProperty("--mouse-x", `${x}%`);
		el.style.setProperty("--mouse-y", `${y}%`);
	}, []);

	const onLeave = useCallback(() => {
		const el = ref.current;
		if (!el) return;
		el.style.setProperty("--mouse-x", "50%");
		el.style.setProperty("--mouse-y", "0%");
	}, []);

	return (
		<div
			ref={ref}
			className={`spotlight-card ${className}`}
			onMouseMove={onMove}
			onMouseLeave={onLeave}
		>
			{children}
		</div>
	);
}
