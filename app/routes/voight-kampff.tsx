import { useState, useCallback, useEffect, useRef } from "react";
import { Terminal } from "lucide-react";
import type { Route } from "./+types/voight-kampff";
import {
	AsciiCanvas,
	type AsciiCanvasHandle,
} from "../components/ascii/AsciiCanvas";
import { ControlPanel } from "../components/ascii/ControlPanel";
import { AnalysisModal } from "../components/ascii/AnalysisModal";
import { BootSequence } from "../components/ascii/BootSequence";
import {
	type AsciiOptions,
	type AnalysisResult,
	DENSITY_MAPS,
} from "../lib/ascii/types";
import { DEFAULT_PERSONA, PERSONAS } from "../lib/ascii/personas";
import { analyzeImage } from "../lib/ascii/geminiClient";
import {
	playAnalysisStartSound,
	playAnalysisCompleteSound,
} from "../lib/ascii/soundEffects";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "V-K UNIT 2049 — Voight-Kampff Analyzer" },
		{
			name: "description",
			content:
				"A Blade Runner-inspired empathy test disguised as a browser toy. Live webcam ASCII vision with a choice of AI personas (Deckard, Tyrell, Roy Batty, GLaDOS, HAL 9000, SHODAN) delivering a Nexus-style threat-level assessment.",
		},
	];
}

const DEFAULT_OPTIONS: AsciiOptions = {
	fontSize: 12,
	brightness: 1.0,
	contrast: 1.0,
	colorMode: "matrix",
	density: "complex",
	resolution: 0.2,
	invert: false,
	cameraFacing: "user",
	persona: DEFAULT_PERSONA,
};

const COLOR_MODES: AsciiOptions["colorMode"][] = [
	"matrix",
	"bw",
	"retro",
	"color",
];
const DENSITIES = Object.keys(DENSITY_MAPS) as AsciiOptions["density"][];

type Toast = { id: number; text: string };

export default function VoightKampffRoute() {
	const [mounted, setMounted] = useState(false);
	const [bootDone, setBootDone] = useState(false);
	const [options, setOptions] = useState<AsciiOptions>(DEFAULT_OPTIONS);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [analysisResult, setAnalysisResult] =
		useState<AnalysisResult | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [toasts, setToasts] = useState<Toast[]>([]);
	const asciiRef = useRef<AsciiCanvasHandle>(null);
	const latestAsciiRef = useRef("");

	useEffect(() => {
		setMounted(true);
	}, []);

	const pushToast = useCallback((text: string) => {
		const id = Date.now() + Math.random();
		setToasts((ts) => [...ts, { id, text }]);
		setTimeout(() => {
			setToasts((ts) => ts.filter((t) => t.id !== id));
		}, 2200);
	}, []);

	const handleCapture = useCallback(
		async (imageData: string) => {
			setIsAnalyzing(true);
			setAnalysisResult(null);
			setIsModalOpen(true);
			playAnalysisStartSound();

			try {
				const result = await analyzeImage(imageData, options.persona);
				setAnalysisResult(result);
				playAnalysisCompleteSound();
			} catch (error) {
				console.error("Analysis failed:", error);
				setAnalysisResult({
					description: "SYSTEM ERROR: Neural link connection failed.",
					tags: ["ERROR", "OFFLINE"],
					threatLevel: "UNKNOWN",
				});
			} finally {
				setIsAnalyzing(false);
			}
		},
		[options.persona],
	);

	const copyAsciiToClipboard = useCallback(async () => {
		const text = asciiRef.current?.getAsciiText() ?? latestAsciiRef.current;
		if (!text) {
			pushToast("NO FRAME DATA YET");
			return;
		}
		try {
			await navigator.clipboard.writeText(text);
			pushToast("ASCII COPIED TO CLIPBOARD");
		} catch (e) {
			console.error("Clipboard write failed", e);
			pushToast("COPY FAILED — CHECK PERMISSIONS");
		}
	}, [pushToast]);

	const downloadAsciiText = useCallback(() => {
		const text = asciiRef.current?.getAsciiText() ?? latestAsciiRef.current;
		if (!text) {
			pushToast("NO FRAME DATA YET");
			return;
		}
		const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `vk_capture_${Date.now()}.txt`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}, [pushToast]);

	const handleScan = useCallback(() => {
		const canvas = document.querySelector<HTMLCanvasElement>(
			"canvas.block.w-full.h-full",
		);
		if (!canvas) return;
		const dataUrl = canvas.toDataURL("image/png");
		void handleCapture(dataUrl);
	}, [handleCapture]);

	const flipCamera = useCallback(() => {
		setOptions((p) => ({
			...p,
			cameraFacing: p.cameraFacing === "user" ? "environment" : "user",
		}));
	}, []);

	const cyclePersona = useCallback(() => {
		setOptions((prev) => {
			const idx = PERSONAS.findIndex((p) => p.id === prev.persona);
			const next = PERSONAS[(idx + 1) % PERSONAS.length];
			pushToast(`PERSONA: ${next.label.toUpperCase()}`);
			return { ...prev, persona: next.id };
		});
	}, [pushToast]);

	// Keyboard shortcuts.
	useEffect(() => {
		if (!mounted || !bootDone) return;
		const onKey = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement | null;
			if (
				target &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable)
			) {
				return;
			}

			if (e.key === "Escape" && isModalOpen) {
				e.preventDefault();
				setIsModalOpen(false);
				return;
			}

			if (isModalOpen) return;

			switch (e.key.toLowerCase()) {
				case " ":
					e.preventDefault();
					handleScan();
					break;
				case "c":
					e.preventDefault();
					void copyAsciiToClipboard();
					break;
				case "d":
					e.preventDefault();
					downloadAsciiText();
					break;
				case "i":
					e.preventDefault();
					setOptions((p) => ({ ...p, invert: !p.invert }));
					break;
				case "f":
					e.preventDefault();
					flipCamera();
					break;
				case "p":
					e.preventDefault();
					cyclePersona();
					break;
				case "m":
					e.preventDefault();
					setOptions((prev) => {
						const idx = COLOR_MODES.indexOf(prev.colorMode);
						return {
							...prev,
							colorMode: COLOR_MODES[(idx + 1) % COLOR_MODES.length],
						};
					});
					break;
				case "x":
					e.preventDefault();
					setOptions((prev) => {
						const idx = DENSITIES.indexOf(prev.density);
						return {
							...prev,
							density: DENSITIES[(idx + 1) % DENSITIES.length],
						};
					});
					break;
				case "+":
				case "=":
					e.preventDefault();
					setOptions((p) => ({
						...p,
						fontSize: Math.min(24, p.fontSize + 1),
					}));
					break;
				case "-":
				case "_":
					e.preventDefault();
					setOptions((p) => ({
						...p,
						fontSize: Math.max(6, p.fontSize - 1),
					}));
					break;
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		mounted,
		bootDone,
		isModalOpen,
		handleScan,
		copyAsciiToClipboard,
		downloadAsciiText,
		flipCamera,
		cyclePersona,
	]);

	const rememberAscii = useCallback((text: string) => {
		latestAsciiRef.current = text;
	}, []);

	const activePersona =
		PERSONAS.find((p) => p.id === options.persona) ?? PERSONAS[0];

	return (
		<div className="relative w-full h-[calc(100vh-56px)] min-h-[600px] bg-black overflow-hidden flex flex-col">
			<header className="absolute top-0 left-0 w-full p-4 z-20 flex flex-wrap gap-2 justify-between items-center pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
				<div className="flex items-center gap-2 text-green-500 pointer-events-auto">
					<Terminal className="w-6 h-6 animate-pulse" />
					<h1 className="text-xl font-bold tracking-widest uppercase font-mono">
						V-K UNIT 2049
						<span className="text-xs ml-2 opacity-70 font-normal tracking-normal">
							/ {activePersona.label}
						</span>
					</h1>
				</div>
				<div className="text-green-800 text-[10px] sm:text-xs flex flex-wrap gap-3 sm:gap-4 font-mono">
					<span className="hidden sm:inline">NEXUS: {activePersona.tag}</span>
					<span>CAM: {options.cameraFacing === "user" ? "FRONT" : "REAR"}</span>
					<span className="animate-pulse">● REC</span>
				</div>
			</header>

			<main className="flex-grow relative z-10">
				{mounted ? (
					<AsciiCanvas
						ref={asciiRef}
						options={options}
						onCapture={handleCapture}
						onAsciiText={rememberAscii}
						onCopyAscii={copyAsciiToClipboard}
						onFlipCamera={flipCamera}
					/>
				) : (
					<div className="absolute inset-0 flex items-center justify-center text-green-500 font-mono text-sm">
						<span className="animate-pulse">INITIALIZING VISUAL CORTEX…</span>
					</div>
				)}
				{mounted && !bootDone && (
					<BootSequence onDone={() => setBootDone(true)} />
				)}
			</main>

			{mounted && (
				<ControlPanel
					options={options}
					setOptions={setOptions}
					onCopyAscii={copyAsciiToClipboard}
					onDownloadAscii={downloadAsciiText}
				/>
			)}

			{isModalOpen && (
				<AnalysisModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					isLoading={isAnalyzing}
					result={analysisResult}
				/>
			)}

			{/* Keyboard shortcut hint */}
			<div className="hidden md:flex absolute top-20 right-4 z-20 text-[10px] font-mono text-green-800/80 flex-col gap-0.5 pointer-events-none">
				<span>[SPACE] SCAN</span>
				<span>[P] PERSONA &nbsp; [F] FLIP CAM</span>
				<span>[I] INVERT &nbsp; [M] MODE &nbsp; [X] CHARSET</span>
				<span>[C] COPY ASCII &nbsp; [D] DOWNLOAD</span>
				<span>[+/-] FONT &nbsp; [ESC] CLOSE</span>
			</div>

			{/* Transient toast stack */}
			<div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
				{toasts.map((t) => (
					<div
						key={t.id}
						className="bg-black/80 border border-green-500/60 text-green-300 px-4 py-2 text-xs font-mono uppercase tracking-wider animate-pulse"
					>
						{t.text}
					</div>
				))}
			</div>

			<div className="absolute inset-0 z-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
		</div>
	);
}
