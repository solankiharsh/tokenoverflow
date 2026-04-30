import { useEffect, useState } from "react";

interface BootSequenceProps {
	onDone: () => void;
	/** Speed multiplier: 1 = default, 0.5 = 2x faster, 2 = half speed. */
	speed?: number;
}

const LINES: Array<{ text: string; delay: number; tone?: "info" | "ok" | "warn" }> = [
	{ text: "[ BIOS v2.0.49 ] TYRELL CORP. / LOS ANGELES - NOV 2049", delay: 220 },
	{ text: "  → Probing ESPER subsystem . . . OK", delay: 260, tone: "ok" },
	{ text: "  → Voight-Kampff coil calibration . . . OK", delay: 260, tone: "ok" },
	{ text: "  → Iris dilation baseline . . . NOMINAL", delay: 240, tone: "ok" },
	{ text: "  → Empathy index reference . . . LOADED", delay: 220, tone: "ok" },
	{ text: "[ V-K UNIT ] Spinning up neural link . . .", delay: 320 },
	{ text: "  ░▒▓ CONNECTED ▓▒░", delay: 260, tone: "ok" },
	{ text: "[ NEXUS LOOKUP ] subject registry: READY", delay: 240, tone: "info" },
	{ text: "  WARNING: this unit will distinguish humans from replicants.", delay: 300, tone: "warn" },
	{ text: "  Press [SPACE] when you are ready to administer the test.", delay: 260, tone: "info" },
];

const TOTAL_DURATION_BUFFER = 600;

export function BootSequence({ onDone, speed = 1 }: BootSequenceProps) {
	const [visibleCount, setVisibleCount] = useState(0);
	const [closing, setClosing] = useState(false);

	useEffect(() => {
		let cancelled = false;
		let elapsed = 0;
		const timers: number[] = [];

		LINES.forEach((line, i) => {
			elapsed += line.delay * speed;
			const t = window.setTimeout(() => {
				if (!cancelled) setVisibleCount(i + 1);
			}, elapsed);
			timers.push(t);
		});

		const closeT = window.setTimeout(() => {
			if (!cancelled) setClosing(true);
		}, elapsed + TOTAL_DURATION_BUFFER * speed);
		timers.push(closeT);

		const doneT = window.setTimeout(() => {
			if (!cancelled) onDone();
		}, elapsed + (TOTAL_DURATION_BUFFER + 500) * speed);
		timers.push(doneT);

		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
				e.preventDefault();
				cancelled = true;
				timers.forEach((id) => window.clearTimeout(id));
				onDone();
			}
		};
		window.addEventListener("keydown", onKey);

		return () => {
			cancelled = true;
			timers.forEach((id) => window.clearTimeout(id));
			window.removeEventListener("keydown", onKey);
		};
	}, [onDone, speed]);

	return (
		<div
			className={`absolute inset-0 z-30 flex items-center justify-center bg-black text-green-400 font-mono text-xs sm:text-sm transition-opacity duration-500 ${
				closing ? "opacity-0" : "opacity-100"
			}`}
			role="status"
			aria-live="polite"
		>
			<div className="w-full max-w-xl px-6">
				<div className="mb-4 border-b border-green-900 pb-3">
					<div className="text-green-500 text-base sm:text-lg tracking-widest font-bold">
						V-K UNIT 2049
					</div>
					<div className="text-green-800 text-[10px] uppercase tracking-widest">
						NEXUS EMPATHY ANALYZER / TYRELL CORP
					</div>
				</div>
				<ul className="space-y-1">
					{LINES.slice(0, visibleCount).map((line, i) => (
						<li
							key={i}
							className={
								line.tone === "ok"
									? "text-green-400"
									: line.tone === "warn"
										? "text-amber-400"
										: line.tone === "info"
											? "text-green-300"
											: "text-green-500"
							}
						>
							{line.text}
						</li>
					))}
					{visibleCount < LINES.length && (
						<li className="text-green-500 animate-pulse">_</li>
					)}
				</ul>
				<button
					type="button"
					onClick={onDone}
					className="mt-6 text-[10px] text-green-700 hover:text-green-400 underline uppercase tracking-widest"
				>
					[ skip ]
				</button>
			</div>
		</div>
	);
}
