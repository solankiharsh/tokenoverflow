import { type Dispatch, type SetStateAction, useState } from "react";
import {
	Sliders,
	Monitor,
	Type,
	Palette,
	Copy,
	Download,
	ChevronDown,
	ChevronUp,
	SunMoon,
	Drama,
} from "lucide-react";
import { type AsciiOptions, DENSITY_MAPS } from "../../lib/ascii/types";
import { PERSONAS } from "../../lib/ascii/personas";
import { playButtonSound } from "../../lib/ascii/soundEffects";

interface ControlPanelProps {
	options: AsciiOptions;
	setOptions: Dispatch<SetStateAction<AsciiOptions>>;
	onCopyAscii?: () => void;
	onDownloadAscii?: () => void;
}

export function ControlPanel({
	options,
	setOptions,
	onCopyAscii,
	onDownloadAscii,
}: ControlPanelProps) {
	const [collapsed, setCollapsed] = useState(false);

	const handleChange = <K extends keyof AsciiOptions>(
		key: K,
		value: AsciiOptions[K],
	) => {
		setOptions((prev) => ({ ...prev, [key]: value }));
	};

	const handleModeChange = <K extends keyof AsciiOptions>(
		key: K,
		value: AsciiOptions[K],
	) => {
		playButtonSound();
		handleChange(key, value);
	};

	return (
		<div className="absolute bottom-0 w-full bg-black/85 border-t border-green-900/50 backdrop-blur-sm z-30 transition-all duration-300">
			{/* Header bar — always visible, collapses the panel on small screens */}
			<div className="flex items-center justify-between px-4 py-2 border-b border-green-900/40">
				<span className="text-[10px] font-mono uppercase tracking-widest text-green-600">
					CONTROL_PANEL
				</span>
				<div className="flex items-center gap-1">
					{onCopyAscii && (
						<button
							type="button"
							onClick={onCopyAscii}
							className="flex items-center gap-1 text-[10px] font-mono uppercase text-green-500 hover:text-green-300 border border-green-800 hover:border-green-500 px-2 py-1"
							title="Copy ASCII text (C)"
						>
							<Copy className="w-3 h-3" />
							<span className="hidden sm:inline">Copy</span>
						</button>
					)}
					{onDownloadAscii && (
						<button
							type="button"
							onClick={onDownloadAscii}
							className="flex items-center gap-1 text-[10px] font-mono uppercase text-green-500 hover:text-green-300 border border-green-800 hover:border-green-500 px-2 py-1"
							title="Download ASCII as .txt (D)"
						>
							<Download className="w-3 h-3" />
							<span className="hidden sm:inline">.txt</span>
						</button>
					)}
					<button
						type="button"
						onClick={() => setCollapsed((c) => !c)}
						className="flex items-center gap-1 text-[10px] font-mono uppercase text-green-500 hover:text-green-300 border border-green-800 hover:border-green-500 px-2 py-1 sm:hidden"
						aria-expanded={!collapsed}
						aria-controls="ascii-controls"
					>
						{collapsed ? (
							<ChevronUp className="w-3 h-3" />
						) : (
							<ChevronDown className="w-3 h-3" />
						)}
					</button>
				</div>
			</div>

			<div
				id="ascii-controls"
				className={`${collapsed ? "hidden sm:block" : "block"} p-3 sm:p-4 overflow-x-auto`}
			>
				<div className="flex flex-nowrap sm:flex-wrap gap-4 sm:gap-6 justify-start sm:justify-center items-center text-green-500 text-xs font-mono min-w-max sm:min-w-0">
					<div className="flex flex-col gap-1 w-32 shrink-0">
						<div className="flex items-center gap-2 mb-1">
							<Type className="w-3 h-3" />
							<label htmlFor="ascii-font-size">
								FONT: {options.fontSize}px
							</label>
						</div>
						<input
							id="ascii-font-size"
							type="range"
							min="6"
							max="24"
							value={options.fontSize}
							onChange={(e) =>
								handleChange("fontSize", Number(e.target.value))
							}
							className="accent-green-500 h-1 bg-green-900 rounded-lg appearance-none cursor-pointer"
						/>
					</div>

					<div className="flex flex-col gap-1 w-32 shrink-0">
						<div className="flex items-center gap-2 mb-1">
							<Sliders className="w-3 h-3" />
							<label htmlFor="ascii-gain">
								GAIN: {options.brightness.toFixed(1)}
							</label>
						</div>
						<input
							id="ascii-gain"
							type="range"
							min="0.5"
							max="2.0"
							step="0.1"
							value={options.brightness}
							onChange={(e) =>
								handleChange("brightness", Number(e.target.value))
							}
							className="accent-green-500 h-1 bg-green-900 rounded-lg appearance-none cursor-pointer"
						/>
					</div>

					<div className="flex flex-col gap-1 w-32 shrink-0">
						<div className="flex items-center gap-2 mb-1">
							<Monitor className="w-3 h-3" />
							<label htmlFor="ascii-contrast">
								CONTRAST: {options.contrast.toFixed(1)}
							</label>
						</div>
						<input
							id="ascii-contrast"
							type="range"
							min="0.5"
							max="3.0"
							step="0.1"
							value={options.contrast}
							onChange={(e) =>
								handleChange("contrast", Number(e.target.value))
							}
							className="accent-green-500 h-1 bg-green-900 rounded-lg appearance-none cursor-pointer"
						/>
					</div>

					<div className="flex flex-col gap-2 shrink-0">
						<div className="flex items-center gap-2">
							<Palette className="w-3 h-3" />
							<span>MODE</span>
						</div>
						<div className="flex gap-1">
							{(["matrix", "bw", "retro", "color"] as const).map((mode) => (
								<button
									key={mode}
									type="button"
									onClick={() => handleModeChange("colorMode", mode)}
									className={`px-2 py-1 border text-[10px] uppercase transition-colors ${
										options.colorMode === mode
											? "bg-green-500 text-black border-green-500"
											: "bg-transparent border-green-800 text-green-700 hover:border-green-500"
									}`}
								>
									{mode}
								</button>
							))}
						</div>
					</div>

					<div className="flex flex-col gap-2 shrink-0">
						<div className="flex items-center gap-2">
							<Type className="w-3 h-3" />
							<span>CHARSET</span>
						</div>
						<div className="flex gap-1">
							{(Object.keys(DENSITY_MAPS) as Array<keyof typeof DENSITY_MAPS>).map(
								(mode) => (
									<button
										key={mode}
										type="button"
										onClick={() => handleModeChange("density", mode)}
										className={`px-2 py-1 border text-[10px] uppercase transition-colors ${
											options.density === mode
												? "bg-green-500 text-black border-green-500"
												: "bg-transparent border-green-800 text-green-700 hover:border-green-500"
										}`}
									>
										{mode}
									</button>
								),
							)}
						</div>
					</div>

					<div className="flex flex-col gap-2 shrink-0">
						<div className="flex items-center gap-2">
							<SunMoon className="w-3 h-3" />
							<span>INVERT</span>
						</div>
						<button
							type="button"
							onClick={() => handleModeChange("invert", !options.invert)}
							className={`px-3 py-1 border text-[10px] uppercase transition-colors ${
								options.invert
									? "bg-green-500 text-black border-green-500"
									: "bg-transparent border-green-800 text-green-700 hover:border-green-500"
							}`}
							aria-pressed={options.invert}
						>
							{options.invert ? "LIGHT" : "DARK"}
						</button>
					</div>

					<div className="flex flex-col gap-2 shrink-0">
						<div className="flex items-center gap-2">
							<Drama className="w-3 h-3" />
							<span>PERSONA</span>
						</div>
						<div className="flex gap-1 flex-wrap max-w-[340px]">
							{PERSONAS.map((p) => (
								<button
									key={p.id}
									type="button"
									onClick={() => handleModeChange("persona", p.id)}
									title={p.short}
									className={`px-2 py-1 border text-[10px] uppercase transition-colors ${
										options.persona === p.id
											? "bg-green-500 text-black border-green-500"
											: "bg-transparent border-green-800 text-green-700 hover:border-green-500"
									}`}
								>
									{p.label}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
