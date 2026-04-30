import {
	useRef,
	useEffect,
	useState,
	useImperativeHandle,
	forwardRef,
	useCallback,
} from "react";
import {
	ScanEye,
	Camera,
	Pause,
	Play,
	Upload,
	Copy,
	SwitchCamera,
} from "lucide-react";
import type { AsciiOptions } from "../../lib/ascii/types";
import { getAsciiChar } from "../../lib/ascii/asciiConverter";
import {
	playStartupSound,
	playScanSound,
	startAmbientHum,
	stopAmbientHum,
} from "../../lib/ascii/soundEffects";

interface AsciiCanvasProps {
	options: AsciiOptions;
	onCapture: (imageData: string) => void;
	onAsciiText?: (text: string) => void;
	onCopyAscii?: () => void;
	onFlipCamera?: () => void;
}

export interface AsciiCanvasHandle {
	/** Force a re-attempt of getUserMedia after the user grants permission. */
	retryCamera: () => void;
	/** Load a user-uploaded image as the source instead of the webcam. */
	loadImage: (file: File) => Promise<void>;
	/** Return the most recently rendered ASCII frame as a plain string. */
	getAsciiText: () => string;
}

type Source =
	| { kind: "none" }
	| { kind: "camera"; stream: MediaStream }
	| { kind: "image"; bitmap: ImageBitmap };

export const AsciiCanvas = forwardRef<AsciiCanvasHandle, AsciiCanvasProps>(
	function AsciiCanvas(
		{ options, onCapture, onAsciiText, onCopyAscii, onFlipCamera },
		ref,
	) {
		const videoRef = useRef<HTMLVideoElement>(null);
		const canvasRef = useRef<HTMLCanvasElement>(null);
		const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
		const prevFrameRef = useRef<Float32Array | null>(null);
		const animationRef = useRef<number | undefined>(undefined);
		const asciiTextRef = useRef<string>("");
		const sourceRef = useRef<Source>({ kind: "none" });
		const pausedRef = useRef(false);

		const [paused, setPaused] = useState(false);
		const [error, setError] = useState<string | null>(null);
		const [cameraAttempt, setCameraAttempt] = useState(0);
		const [sourceKind, setSourceKind] = useState<"camera" | "image" | "none">(
			"none",
		);

		// Keep pausedRef synced for the render loop (avoids re-subscribing on every toggle).
		useEffect(() => {
			pausedRef.current = paused;
		}, [paused]);

		// Acquire camera (re-runs on retry or when user flips front/rear).
		useEffect(() => {
			if (sourceRef.current.kind === "image") return; // user picked an image instead

			let localStream: MediaStream | null = null;
			let cancelled = false;

			// Stop any in-flight camera so we can re-request with the new facingMode.
			if (
				sourceRef.current.kind === "camera" &&
				sourceRef.current.stream
			) {
				sourceRef.current.stream.getTracks().forEach((t) => t.stop());
			}

			const startCamera = async () => {
				try {
					const stream = await navigator.mediaDevices.getUserMedia({
						video: {
							width: { ideal: 640 },
							height: { ideal: 480 },
							facingMode: options.cameraFacing,
						},
					});
					if (cancelled) {
						stream.getTracks().forEach((t) => t.stop());
						return;
					}
					localStream = stream;
					sourceRef.current = { kind: "camera", stream };
					setSourceKind("camera");
					setError(null);

					if (videoRef.current) {
						videoRef.current.srcObject = stream;
						await videoRef.current.play().catch((e) => {
							console.error("Play error:", e);
						});
						playStartupSound();
						startAmbientHum();
					}
				} catch (err) {
					console.error("Error accessing camera:", err);
					if (!cancelled) {
						setError(
							"Camera access denied or unavailable. You can enable it, or upload an image instead.",
						);
						setSourceKind("none");
					}
				}
			};

			startCamera();

			return () => {
				cancelled = true;
				if (localStream) {
					localStream.getTracks().forEach((track) => track.stop());
				}
				stopAmbientHum();
			};
		}, [cameraAttempt, options.cameraFacing]);

		// Resize observer for the visible canvas.
		useEffect(() => {
			const handleResize = () => {
				if (!canvasRef.current) return;
				const parent = canvasRef.current.parentElement;
				if (parent) {
					canvasRef.current.width = parent.clientWidth;
					canvasRef.current.height = parent.clientHeight;
				} else {
					canvasRef.current.width = window.innerWidth;
					canvasRef.current.height = window.innerHeight;
				}
			};
			window.addEventListener("resize", handleResize);
			handleResize();
			return () => window.removeEventListener("resize", handleResize);
		}, []);

		useEffect(() => {
			prevFrameRef.current = null;
		}, [options.fontSize]);

		// Main render loop.
		useEffect(() => {
			const renderLoop = () => {
				const canvas = canvasRef.current;
				const hiddenCanvas = hiddenCanvasRef.current;
				if (!canvas || !hiddenCanvas) {
					animationRef.current = requestAnimationFrame(renderLoop);
					return;
				}

				// If paused, just keep the rAF alive but don't redraw.
				if (pausedRef.current) {
					animationRef.current = requestAnimationFrame(renderLoop);
					return;
				}

				const source = sourceRef.current;
				const video = videoRef.current;
				const videoReady =
					source.kind === "camera" && video && video.readyState >= 2;
				const imageReady = source.kind === "image";

				if (!videoReady && !imageReady) {
					animationRef.current = requestAnimationFrame(renderLoop);
					return;
				}

				const ctx = canvas.getContext("2d", { alpha: false });
				const hiddenCtx = hiddenCanvas.getContext("2d", {
					willReadFrequently: true,
				});
				if (!ctx || !hiddenCtx) {
					animationRef.current = requestAnimationFrame(renderLoop);
					return;
				}

				const charHeight = options.fontSize;
				const charWidth = charHeight * 0.6;
				const cols = Math.floor(canvas.width / charWidth);
				const rows = Math.floor(canvas.height / charHeight);

				if (cols <= 0 || rows <= 0) {
					animationRef.current = requestAnimationFrame(renderLoop);
					return;
				}

				if (hiddenCanvas.width !== cols || hiddenCanvas.height !== rows) {
					hiddenCanvas.width = cols;
					hiddenCanvas.height = rows;
					prevFrameRef.current = null;
				}

				// Draw the source (mirrored for camera, un-mirrored for image).
				hiddenCtx.save();
				if (source.kind === "camera" && video) {
					hiddenCtx.translate(cols, 0);
					hiddenCtx.scale(-1, 1);
					hiddenCtx.drawImage(video, 0, 0, cols, rows);
				} else if (source.kind === "image") {
					hiddenCtx.drawImage(source.bitmap, 0, 0, cols, rows);
				}
				hiddenCtx.restore();

				const frameData = hiddenCtx.getImageData(0, 0, cols, rows);
				const data = frameData.data;
				const pixelCount = data.length;

				if (
					!prevFrameRef.current ||
					prevFrameRef.current.length !== pixelCount
				) {
					prevFrameRef.current = new Float32Array(pixelCount);
					for (let i = 0; i < pixelCount; i++) {
						prevFrameRef.current[i] = data[i];
					}
				}

				const prev = prevFrameRef.current;
				// Still images don't need temporal smoothing; camera does.
				const inertia = source.kind === "image" ? 0 : 0.75;

				for (let i = 0; i < pixelCount; i++) {
					const target = data[i];
					const current = prev[i];
					const newValue = current + (target - current) * (1 - inertia);
					prev[i] = newValue;
					data[i] = newValue;
				}

				const invert = options.invert;
				ctx.fillStyle = invert ? "#f5f5f5" : "#000000";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.font = `${options.fontSize}px 'JetBrains Mono', ui-monospace, monospace`;
				ctx.textBaseline = "top";

				const contrastFactor =
					(259 * (options.contrast * 255 + 255)) /
					(255 * (259 - options.contrast * 255));

				const lines: string[] = [];

				if (options.colorMode === "color") {
					for (let y = 0; y < rows; y++) {
						let rowText = "";
						for (let x = 0; x < cols; x++) {
							const offset = (y * cols + x) * 4;
							const r = data[offset];
							const g = data[offset + 1];
							const b = data[offset + 2];

							let brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
							brightness = contrastFactor * (brightness - 128) + 128;
							brightness *= options.brightness;
							brightness = Math.max(0, Math.min(255, brightness));

							const char = getAsciiChar(brightness, options.density);
							rowText += char;
							ctx.fillStyle = `rgb(${r},${g},${b})`;
							ctx.fillText(char, x * charWidth, y * charHeight);
						}
						lines.push(rowText);
					}
				} else {
					if (options.colorMode === "matrix") {
						ctx.fillStyle = invert ? "#007a25" : "#00ff41";
					} else if (options.colorMode === "retro") {
						ctx.fillStyle = invert ? "#8b5a00" : "#ffb000";
					} else {
						ctx.fillStyle = invert ? "#0a0a0a" : "#ffffff";
					}

					for (let y = 0; y < rows; y++) {
						let rowText = "";
						for (let x = 0; x < cols; x++) {
							const offset = (y * cols + x) * 4;
							const r = data[offset];
							const g = data[offset + 1];
							const b = data[offset + 2];

							let brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
							brightness = contrastFactor * (brightness - 128) + 128;
							brightness *= options.brightness;
							brightness = Math.max(0, Math.min(255, brightness));

							rowText += getAsciiChar(brightness, options.density);
						}
						ctx.fillText(rowText, 0, y * charHeight);
						lines.push(rowText);
					}
				}

				asciiTextRef.current = lines.join("\n");
				onAsciiText?.(asciiTextRef.current);

				animationRef.current = requestAnimationFrame(renderLoop);
			};

			animationRef.current = requestAnimationFrame(renderLoop);
			return () => {
				if (animationRef.current) {
					cancelAnimationFrame(animationRef.current);
				}
			};
		}, [options, onAsciiText]);

		const handleCaptureClick = useCallback(() => {
			if (!canvasRef.current) return;
			playScanSound();
			const dataUrl = canvasRef.current.toDataURL("image/png");
			onCapture(dataUrl);
		}, [onCapture]);

		const handleScreenshotClick = useCallback(() => {
			if (!canvasRef.current) return;
			playScanSound();
			const dataUrl = canvasRef.current.toDataURL("image/png");
			const link = document.createElement("a");
			link.href = dataUrl;
			link.download = `cyber_ascii_${Date.now()}.png`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}, []);

		const togglePause = useCallback(() => {
			setPaused((p) => !p);
		}, []);

		useImperativeHandle(
			ref,
			() => ({
				retryCamera: () => setCameraAttempt((n) => n + 1),
				loadImage: async (file: File) => {
					// Stop any live camera stream.
					if (sourceRef.current.kind === "camera") {
						sourceRef.current.stream.getTracks().forEach((t) => t.stop());
					}
					try {
						const bitmap = await createImageBitmap(file);
						sourceRef.current = { kind: "image", bitmap };
						prevFrameRef.current = null;
						setSourceKind("image");
						setError(null);
					} catch (e) {
						console.error("Failed to load image:", e);
						setError("Could not load that image. Try a PNG or JPEG.");
					}
				},
				getAsciiText: () => asciiTextRef.current,
			}),
			[],
		);

		const showPermissionPrompt = error !== null && sourceKind !== "image";

		return (
			<div className="relative w-full h-full bg-black">
				{showPermissionPrompt && (
					<div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-black/90 text-green-400 p-8 text-center font-mono">
						<p className="text-sm max-w-md">{error}</p>
						<div className="flex flex-wrap gap-3 justify-center">
							<button
								type="button"
								onClick={() => setCameraAttempt((n) => n + 1)}
								className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/40 border border-green-500/60 text-green-300 px-4 py-2 text-xs uppercase tracking-wider"
							>
								<Camera className="w-4 h-4" />
								Enable Camera
							</button>
							<label className="flex items-center gap-2 bg-black/60 hover:bg-green-900/40 border border-green-500/60 text-green-300 px-4 py-2 text-xs uppercase tracking-wider cursor-pointer">
								<Upload className="w-4 h-4" />
								Upload Image
								<input
									type="file"
									accept="image/png,image/jpeg"
									className="hidden"
									onChange={(e) => {
										const f = e.target.files?.[0];
										if (f) void handleImageFile(f);
										e.target.value = "";
									}}
								/>
							</label>
						</div>
					</div>
				)}
				<video
					ref={videoRef}
					className="absolute top-0 left-0 opacity-0 pointer-events-none -z-10 w-1 h-1"
					playsInline
					autoPlay
					muted
				/>
				<canvas ref={hiddenCanvasRef} className="hidden" />
				<canvas ref={canvasRef} className="block w-full h-full" />

				<div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex items-center gap-4 sm:gap-6 z-40 flex-wrap justify-center max-w-[calc(100vw-2rem)]">
					<button
						type="button"
						onClick={togglePause}
						className="bg-black/60 hover:bg-green-900/80 text-green-400 border border-green-500/50 p-3 sm:p-4 rounded-full backdrop-blur-md transition-all active:scale-95"
						title={paused ? "Resume feed" : "Pause feed"}
						aria-label={paused ? "Resume feed" : "Pause feed"}
					>
						{paused ? (
							<Play className="w-5 h-5" />
						) : (
							<Pause className="w-5 h-5" />
						)}
					</button>

					<button
						type="button"
						onClick={onCopyAscii}
						disabled={!onCopyAscii}
						className="bg-black/60 hover:bg-green-900/80 text-green-400 border border-green-500/50 p-3 sm:p-4 rounded-full backdrop-blur-md transition-all active:scale-95 disabled:opacity-50"
						title="Copy ASCII text to clipboard"
						aria-label="Copy ASCII text"
					>
						<Copy className="w-5 h-5" />
					</button>

					{onFlipCamera && (
						<button
							type="button"
							onClick={onFlipCamera}
							disabled={sourceKind === "image"}
							className="bg-black/60 hover:bg-green-900/80 text-green-400 border border-green-500/50 p-3 sm:p-4 rounded-full backdrop-blur-md transition-all active:scale-95 disabled:opacity-50"
							title={
								options.cameraFacing === "user"
									? "Switch to rear camera"
									: "Switch to front camera"
							}
							aria-label="Flip camera"
						>
							<SwitchCamera className="w-5 h-5" />
						</button>
					)}

					<button
						type="button"
						onClick={handleScreenshotClick}
						className="bg-black/60 hover:bg-green-900/80 text-green-400 border border-green-500/50 p-3 sm:p-4 rounded-full backdrop-blur-md transition-all active:scale-95 hover:scale-105 hover:shadow-[0_0_15px_rgba(0,255,0,0.3)]"
						title="Save PNG Snapshot"
						aria-label="Save PNG Snapshot"
					>
						<Camera className="w-5 h-5" />
					</button>

					<button
						type="button"
						onClick={handleCaptureClick}
						className="bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/50 p-5 sm:p-6 rounded-full backdrop-blur-md transition-all active:scale-95 group relative hover:shadow-[0_0_25px_rgba(0,255,0,0.5)]"
						title="Scan & Analyze"
						aria-label="Scan and Analyze"
					>
						<div className="absolute inset-0 rounded-full border border-green-500 opacity-50 animate-ping" />
						<ScanEye className="w-7 h-7 sm:w-8 sm:h-8" />
					</button>

					<label
						className="bg-black/60 hover:bg-green-900/80 text-green-400 border border-green-500/50 p-3 sm:p-4 rounded-full backdrop-blur-md transition-all active:scale-95 cursor-pointer"
						title="Upload image (replaces camera feed)"
					>
						<Upload className="w-5 h-5" />
						<input
							type="file"
							accept="image/png,image/jpeg"
							className="hidden"
							onChange={(e) => {
								const f = e.target.files?.[0];
								if (f) void handleImageFile(f);
								e.target.value = "";
							}}
						/>
					</label>
				</div>
			</div>
		);

		async function handleImageFile(file: File) {
			if (sourceRef.current.kind === "camera") {
				sourceRef.current.stream.getTracks().forEach((t) => t.stop());
				stopAmbientHum();
			}
			try {
				const bitmap = await createImageBitmap(file);
				sourceRef.current = { kind: "image", bitmap };
				prevFrameRef.current = null;
				setSourceKind("image");
				setError(null);
			} catch (e) {
				console.error("Failed to load image:", e);
				setError("Could not load that image. Try a PNG or JPEG.");
			}
		}
	},
);
