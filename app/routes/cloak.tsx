import type { Route } from "./+types/cloak";

const env =
	(typeof import.meta !== "undefined" ? import.meta.env : {}) as Record<string, string | undefined>;

const version = env.VITE_CLOAK_VERSION ?? "app-v0.1.0";
const released = env.VITE_CLOAK_RELEASED ?? "";
const totalDownloads = env.VITE_CLOAK_DOWNLOADS ?? "0";
const macosInstallDocUrl = env.VITE_CLOAK_MACOS_INSTALL_DOC ?? "";

const downloads = {
	macos: [
		{ label: "Apple Silicon", url: env.VITE_CLOAK_DMG_ARM64 ?? "", size: env.VITE_CLOAK_DMG_ARM64_SIZE },
		{ label: "Intel", url: env.VITE_CLOAK_DMG_X64 ?? "", size: env.VITE_CLOAK_DMG_X64_SIZE },
	],
	windows: [
		{ label: "EXE Installer", url: env.VITE_CLOAK_WIN_EXE ?? "", size: env.VITE_CLOAK_WIN_EXE_SIZE },
		{ label: "MSI Installer", url: env.VITE_CLOAK_WIN_MSI ?? "", size: env.VITE_CLOAK_WIN_MSI_SIZE },
	],
	linux: [
		{ label: "RPM Package", url: env.VITE_CLOAK_LINUX_RPM ?? "", size: env.VITE_CLOAK_LINUX_RPM_SIZE },
		{ label: "AppImage", url: env.VITE_CLOAK_LINUX_APPIMAGE ?? "", size: env.VITE_CLOAK_LINUX_APPIMAGE_SIZE },
		{ label: "DEB Package", url: env.VITE_CLOAK_LINUX_DEB ?? "", size: env.VITE_CLOAK_LINUX_DEB_SIZE },
	],
};

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Download Cloak — Invisible AI Assistant" },
		{
			name: "description",
			content:
				"Get the latest version of Cloak: your invisible AI assistant. macOS, Windows, and Linux.",
		},
	];
}

function DownloadButton({
	label,
	url,
	size,
}: { label: string; url: string; size?: string }) {
	const hasUrl = Boolean(url);
	return (
		<a
			href={hasUrl ? url : undefined}
			target={hasUrl ? "_self" : undefined}
			rel={hasUrl ? "noreferrer" : undefined}
			className={`inline-flex items-center gap-2 font-display font-bold text-sm uppercase py-2.5 px-4 border-[3px] border-comic-black transition-all w-full sm:w-auto justify-center ${
				hasUrl
					? "bg-comic-yellow text-comic-black hover:bg-comic-yellow-hover shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-0.5"
					: "bg-comic-gray text-comic-gray-medium cursor-not-allowed opacity-70"
			}`}
			aria-disabled={!hasUrl}
			onClick={!hasUrl ? (e) => e.preventDefault() : undefined}
		>
			<svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
				<path d="M12 2a1 1 0 0 1 1 1v10.59l4.29-4.3a1 1 0 1 1 1.42 1.42l-6 6a1 1 0 0 1-1.42 0l-6-6a1 1 0 1 1 1.42-1.42L11 13.59V3a1 1 0 0 1 1-1z" />
			</svg>
			{label}
			{size && hasUrl && <span className="text-xs opacity-80">({size})</span>}
		</a>
	);
}

function OsCard({
	title,
	description,
	icon,
	items,
}: {
	title: string;
	description: string;
	icon: React.ReactNode;
	items: { label: string; url: string; size?: string }[];
}) {
	return (
		<article className="comic-card-hover p-6 flex flex-col">
			<div className="flex items-center gap-3 mb-2">
				<span className="text-3xl" aria-hidden>{icon}</span>
				<h2 className="comic-heading text-xl text-comic-black">{title}</h2>
			</div>
			<p className="text-sm text-comic-gray-medium mb-4 flex-1">{description}</p>
			<div className="flex flex-col sm:flex-row flex-wrap gap-2">
				{items.map((item) => (
					<DownloadButton
						key={item.label}
						label={item.label}
						url={item.url}
						size={item.size}
					/>
				))}
			</div>
		</article>
	);
}

export default function Cloak() {
	return (
		<div className="min-h-[80vh]">
			<section className="max-w-4xl mx-auto px-4 pt-16 pb-10 sm:pt-24">
				<h1 className="comic-heading text-4xl sm:text-5xl text-comic-black mb-3">
					DOWNLOAD <span className="yellow-highlight">CLOAK</span>
				</h1>
				<p className="text-lg text-comic-gray-medium mb-8">
					Get the latest version of your invisible AI assistant.
				</p>

				<div className="flex flex-wrap items-center gap-4 text-sm">
					<span className="inline-flex items-center gap-1.5 px-2.5 py-1 border-2 border-comic-black bg-comic-yellow text-comic-black font-mono font-medium">
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
							<path d="M12 22c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9zm1-16v6l4.24 2.5.76-1.29-3.5-2.06V6z" />
						</svg>
						Latest: {version}
					</span>
					{released && (
						<span className="text-comic-gray-medium">Released {released}</span>
					)}
					<span className="inline-flex items-center gap-1.5 text-comic-gray-medium">
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
							<path d="M12 2a1 1 0 0 1 1 1v10.59l4.29-4.3a1 1 0 1 1 1.42 1.42l-6 6a1 1 0 0 1-1.42 0l-6-6a1 1 0 1 1 1.42-1.42L11 13.59V3a1 1 0 0 1 1-1z" />
						</svg>
						{totalDownloads} downloads
					</span>
				</div>
			</section>

			<section className="max-w-4xl mx-auto px-4 py-12">
				<div className="grid gap-6 sm:grid-cols-3">
					<OsCard
						title="macOS"
						description="Native macOS application. Apple Silicon (M1/M2/M3) or Intel."
						icon={<span className="text-3xl" aria-hidden>🍎</span>}
						items={downloads.macos}
					/>
					<OsCard
						title="Windows"
						description="Windows installer. EXE or MSI."
						icon={
							<svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
								<path d="M3 5.5L10.5 4v7.5H3V5.5zm0 9H10.5V20L3 18.5V14.5zm9-10.5L21 3v7.5h-9V4zm0 9H21v7.5l-9-1.5V13.5z" />
							</svg>
						}
						items={downloads.windows}
					/>
					<OsCard
						title="Linux"
						description="Linux packages. RPM, AppImage, or DEB."
						icon={<span className="text-3xl" aria-hidden>🐧</span>}
						items={downloads.linux}
					/>
				</div>
			</section>

			{macosInstallDocUrl && (
				<section className="max-w-4xl mx-auto px-4 pb-16">
					<div className="border-[3px] border-comic-black bg-comic-gray p-4">
						<h3 className="comic-heading text-sm text-comic-black mb-1">
							macOS installation
						</h3>
						<p className="text-sm text-comic-gray-medium">
							If you run into installation issues on macOS, see our{" "}
							<a
								href={macosInstallDocUrl}
								target="_blank"
								rel="noreferrer"
								className="font-display font-bold text-comic-black hover:text-comic-yellow transition underline"
							>
								step-by-step guide
							</a>{" "}
							to resolve common problems.
						</p>
					</div>
				</section>
			)}

			<section className="max-w-4xl mx-auto px-4 pb-16">
				<p className="text-sm text-comic-gray-medium">
					Cloak runs on your machine: real-time transcription, call summaries, Google Calendar, and a
					knowledge base. Use your own API keys; no account required.
				</p>
			</section>
		</div>
	);
}
