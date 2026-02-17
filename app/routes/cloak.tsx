import { useState } from "react";
import type { Route } from "./+types/cloak";

const env =
	(typeof import.meta !== "undefined" ? import.meta.env : {}) as Record<string, string | undefined>;

const version = env.VITE_CLOAK_VERSION ?? "0.1.9";
const released = env.VITE_CLOAK_RELEASED ?? "";
const totalDownloads = env.VITE_CLOAK_DOWNLOADS ?? "0";
const macosInstallDocUrl = env.VITE_CLOAK_MACOS_INSTALL_DOC ?? "";

/** Single download: macOS Apple Silicon (M1/M2/M3) DMG from Supabase. */
const downloadUrl =
	env.VITE_CLOAK_DMG_ARM64 ??
	"https://ekjeqgyghkuqskiexvsg.supabase.co/storage/v1/object/public/cloak-releases/v0.1.9/dmg/Cloak_0.1.9_aarch64.dmg";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Cloak — Invisible AI Assistant" },
		{
			name: "description",
			content:
				"Your invisible AI assistant. Stealth in meetings, real-time transcription, call summaries. Tauri + Rust. Privacy-first, ~10MB. macOS.",
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
			target={hasUrl ? "_blank" : undefined}
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

const WHY_ITEMS = [
	{ title: "Complete invisibility", desc: "Undetectable in video calls, screen shares, and recordings." },
	{ title: "Privacy-first", desc: "Data stored locally. Use your own API keys; no account required." },
	{ title: "Small & fast", desc: "Built with Tauri and Rust. ~10MB, launches in under a second." },
	{ title: "Screenshot-proof", desc: "Translucent overlay design doesn’t show up in screenshots." },
	{ title: "No servers", desc: "Direct API calls to your chosen AI and STT providers." },
	{ title: "Any AI provider", desc: "OpenAI, Claude, Gemini, Groq, or custom endpoints." },
	{ title: "System audio capture", desc: "Real-time transcription during meetings (e.g. Cmd+Shift+M)." },
	{ title: "Meetings & summaries", desc: "Auto-save transcripts and generate call summaries." },
	{ title: "Always on top", desc: "Position the assistant anywhere; access during any app." },
];

const FAQ_ITEMS = [
	{
		q: "How is Cloak invisible in video calls?",
		a: "The overlay window is translucent and doesn’t appear in typical screen capture or video call streams. It sits above your apps but stays invisible to others.",
	},
	{
		q: "How is my data handled?",
		a: "Everything runs on your machine. Transcripts and meetings are stored locally. You connect to AI and speech-to-text with your own API keys—no data is sent to Cloak servers.",
	},
	{
		q: "Which operating systems are supported?",
		a: "Currently macOS (Apple Silicon M1/M2/M3). Windows and Linux builds may be added later.",
	},
	{
		q: "Is Cloak free to use?",
		a: "Yes. You pay only for the AI and STT APIs you choose (e.g. OpenAI, Anthropic). No Cloak subscription required.",
	},
	{
		q: "Can I customize keyboard shortcuts?",
		a: "Yes. Toggle window, system audio capture, voice input, and other actions have configurable global shortcuts.",
	},
];

const CLOAK_ANCHORS = [
	{ href: "#download", label: "Downloads" },
	{ href: "#features", label: "Features" },
	{ href: "#why", label: "Why Cloak?" },
	{ href: "#pricing", label: "Pricing" },
	{ href: "#affiliate", label: "Affiliate" },
];

type BillingCycle = "one-time" | "monthly" | "yearly";

const FREE_FEATURES = [
	"Undetectable in video calls and screen shares",
	"Multiple AI provider support (bring your own API keys)",
	"Speech-to-text integration (bring your own providers)",
	"Custom provider configuration",
	"Voice activity detection",
	"Screenshot capture",
	"Multiple system prompt profiles",
	"No signup or subscription required",
	"Invisible mouse cursor",
	"Zero data storage or collection (100% privacy)",
	"Automatic updates",
];

const LIMITED_PRO_FEATURES = [
	"Everything included in the Free plan",
	"120+ premium AI models with instant access",
	"1500 AI and Speech-to-text generations per month",
	"Advanced speech-to-text with highest accuracy",
	"Draggable floating UI window",
	"Customizable shortcuts",
	"Zero maintenance and setup",
	"One-click model switching",
	"Generate system prompts with AI",
	"Invisible mouse and customizable transparent overlay",
	"Selection mode to capture screenshots",
];

const UNLIMITED_PRO_FEATURES = [
	"Everything included in the Limited Pro plan",
	"No monthly limits on AI and Speech-to-text generations",
	"2 device activations",
	"Unlimited AI generations",
	"Unlimited Speech-to-text",
	"Priority feature requests and premium support",
];

const DEV_PRO_FEATURES = [
	"All features included in the Free plan",
	"All Pro features without bundled AI & Speech-to-text; bring your own LLM and transcription providers",
	"Priority feature requests",
];

function CheckIcon() {
	return (
		<svg className="w-4 h-4 shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
			<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
		</svg>
	);
}

/** Unified CTA for pricing cards: same size and position for "Current Plan" vs "Get X License". */
function PlanCTA({
	variant,
	label,
	href,
}: {
	variant: "current" | "license";
	label: string;
	href?: string;
}) {
	const baseClass =
		"w-full py-3 px-4 border-[3px] border-comic-black font-display font-bold text-sm uppercase text-center transition flex items-center justify-center";
	if (variant === "current") {
		return (
			<button
				type="button"
				className={`${baseClass} bg-comic-gray text-comic-gray-dark cursor-default shadow-[2px_2px_0_0_#000]`}
				disabled
			>
				{label}
			</button>
		);
	}
	return (
		<a
			href={href ?? "#"}
			className={`${baseClass} bg-comic-yellow text-comic-black hover:bg-comic-yellow-hover shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-0.5 no-underline`}
		>
			{label}
		</a>
	);
}

export default function Cloak() {
	const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
	return (
		<div className="min-h-[80vh]">
			{/* In-page nav (Pluely-style: scroll to sections) */}
			<nav
				className="sticky top-0 z-10 border-b-[3px] border-comic-black bg-comic-white font-sans font-medium text-sm"
				style={{ boxShadow: "0 2px 0 0 #000" }}
				aria-label="Cloak page"
			>
				<div className="max-w-4xl mx-auto px-4 py-3">
					<ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-start">
						{CLOAK_ANCHORS.map(({ href, label }) => (
							<li key={href}>
								<a
									href={href}
									className="text-comic-black hover:text-comic-yellow transition underline decoration-2 underline-offset-2"
								>
									{label}
								</a>
							</li>
						))}
					</ul>
				</div>
			</nav>

			{/* Hero */}
			<section className="max-w-4xl mx-auto px-4 pt-12 pb-12 sm:pt-16 sm:pb-16">
				<h1 className="comic-heading text-4xl sm:text-5xl lg:text-6xl text-comic-black mb-4 leading-tight">
					YOUR INVISIBLE <span className="yellow-highlight">AI ASSISTANT</span>
				</h1>
				<p className="cloak-body text-lg sm:text-xl text-comic-gray-dark mb-6 max-w-2xl leading-relaxed">
					Cloak runs with complete stealth during meetings, interviews, and presentations. Undetectable in
					video calls, screen shares, and recordings. Built with Tauri and Rust for small size, speed,
					and privacy. Your conversations stay local; your data stays yours.
				</p>
				<div className="flex flex-wrap items-center gap-4 mb-8">
					<DownloadButton label="Download for macOS" url={downloadUrl} />
					<span className="inline-flex items-center gap-1.5 px-2.5 py-1 border-2 border-comic-black bg-comic-yellow text-comic-black font-mono text-sm font-medium">
						v{version}
					</span>
					{released && (
						<span className="text-comic-gray-medium text-sm">Released {released}</span>
					)}
					{totalDownloads !== "0" && (
						<span className="text-comic-gray-medium text-sm">{totalDownloads} downloads</span>
					)}
				</div>
			</section>

			{/* Why Cloak */}
			<section className="max-w-4xl mx-auto px-4 py-12 sm:py-16" id="why">
				<h2 className="comic-heading text-2xl sm:text-3xl text-comic-black mb-6">
					WHY <span className="yellow-highlight">CLOAK</span>?
				</h2>
				<p className="cloak-body text-comic-gray-dark mb-8 max-w-2xl leading-relaxed">
					An AI assistant built for privacy, performance, and discretion. Enterprise-style features
					without sending your data to third-party servers.
				</p>
				<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{WHY_ITEMS.map((item) => (
						<li key={item.title} className="comic-card-hover p-5">
							<h3 className="comic-heading text-sm text-comic-black mb-1">{item.title}</h3>
							<p className="cloak-body text-base text-comic-gray-dark leading-snug">{item.desc}</p>
						</li>
					))}
				</ul>
			</section>

			{/* Features */}
			<section className="max-w-4xl mx-auto px-4 py-12 sm:py-16" id="features">
				<h2 className="comic-heading text-2xl sm:text-3xl text-comic-black mb-8">
					FEATURES
				</h2>
				<div className="space-y-8">
					<div className="border-[3px] border-comic-black bg-comic-gray p-5 sm:p-6">
						<h3 className="comic-heading text-lg text-comic-black mb-2">Complete invisibility</h3>
						<p className="cloak-body text-base text-comic-gray-dark leading-relaxed">
							The overlay sits above all apps but stays invisible in Zoom, Google Meet, Microsoft
							Teams, and Slack Huddles. No one sees your assistant.
						</p>
					</div>
					<div className="border-[3px] border-comic-black bg-comic-gray p-5 sm:p-6">
						<h3 className="comic-heading text-lg text-comic-black mb-2">System audio capture (Cmd+Shift+M)</h3>
						<p className="cloak-body text-base text-comic-gray-dark leading-relaxed">
							Capture system audio in real time during meetings. Speech-to-text runs with your
							chosen provider (e.g. Whisper, Groq). Voice activity detection and instant access
							via a global shortcut.
						</p>
					</div>
					<div className="border-[3px] border-comic-black bg-comic-gray p-5 sm:p-6">
						<h3 className="comic-heading text-lg text-comic-black mb-2">Keyboard shortcuts</h3>
						<p className="cloak-body text-base text-comic-gray-dark leading-relaxed">
							Customizable global shortcuts: toggle window, dashboard, system audio, voice input,
							screenshot. Stay in flow without leaving your current app.
						</p>
					</div>
					<div className="border-[3px] border-comic-black bg-comic-gray p-5 sm:p-6">
						<h3 className="comic-heading text-lg text-comic-black mb-2">Meetings & summaries</h3>
						<p className="cloak-body text-base text-comic-gray-dark leading-relaxed">
							Auto-save transcripts when you stop a capture. Generate summaries and keep notes
							locally. Optional Google Calendar integration.
						</p>
					</div>
					<div className="border-[3px] border-comic-black bg-comic-gray p-5 sm:p-6">
						<h3 className="comic-heading text-lg text-comic-black mb-2">Your data stays local</h3>
						<p className="cloak-body text-base text-comic-gray-dark leading-relaxed">
							Cloak runs on your machine. Real-time transcription, call summaries, and knowledge
							base use your own API keys. No Cloak account, no telemetry.
						</p>
					</div>
				</div>
			</section>

			{/* Pricing */}
			<section className="max-w-4xl mx-auto px-4 py-12 sm:py-16" id="pricing">
				<h2 className="comic-heading text-2xl sm:text-3xl text-comic-black mb-6">
					PRICING
				</h2>
				{/* Billing cycle toggle */}
				<div className="flex flex-wrap gap-2 justify-center mb-10">
					{(["one-time", "monthly", "yearly"] as const).map((cycle) => (
						<button
							key={cycle}
							type="button"
							onClick={() => setBillingCycle(cycle)}
							className={`cloak-body px-4 py-2.5 border-2 border-comic-black font-medium transition-all ${
								billingCycle === cycle
									? "bg-comic-black text-comic-white"
									: "bg-comic-gray text-comic-black hover:bg-comic-yellow"
							}`}
						>
							{cycle === "one-time" ? "One Time" : cycle === "monthly" ? "Monthly" : "Yearly"}
						</button>
					))}
				</div>
				{/* Plan cards: same structure so CTAs align at bottom; PlanCTA for uniformity */}
				<div className={`grid gap-6 items-stretch ${billingCycle === "one-time" ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
					{/* Free plan (always shown) */}
					<div className="border-[3px] border-comic-black bg-comic-gray p-6 flex flex-col min-h-[380px]">
						<h3 className="comic-heading text-xl text-comic-black mb-1">Free</h3>
						<p className="cloak-body text-comic-gray-dark mb-2">
							<span className="text-2xl font-bold text-comic-black">$0</span>
							<span className="text-comic-gray-medium"> / forever</span>
						</p>
						<span className="inline-block cloak-body text-xs text-comic-gray-medium border border-comic-black px-2 py-0.5 w-fit mb-4">
							Save 100%
						</span>
						<ul className="flex-1 space-y-2 min-h-0">
							{FREE_FEATURES.map((f) => (
								<li key={f} className="flex gap-2 cloak-body text-comic-gray-dark text-sm leading-snug">
									<CheckIcon />
									<span>{f}</span>
								</li>
							))}
						</ul>
						<div className="mt-4 pt-4 border-t-2 border-comic-black/20">
							<PlanCTA variant="current" label="Current Plan" />
						</div>
					</div>

					{billingCycle === "one-time" ? (
						/* Dev Pro (one-time only) */
						<div className="border-[3px] border-comic-black bg-comic-gray p-6 flex flex-col min-h-[380px]">
							<h3 className="comic-heading text-xl text-comic-black mb-1">Dev Pro</h3>
							<p className="cloak-body text-comic-gray-dark mb-2">
								<span className="text-comic-gray-medium line-through">$150</span>{" "}
								<span className="text-2xl font-bold text-comic-black">$120</span>
								<span className="text-comic-gray-medium"> / forever</span>
							</p>
							<span className="inline-block cloak-body text-xs text-comic-gray-medium border border-comic-black px-2 py-0.5 w-fit mb-4">
								Save 20% (limited time offer)
							</span>
							<ul className="flex-1 space-y-2 min-h-0">
								{DEV_PRO_FEATURES.map((f) => (
									<li key={f} className="flex gap-2 cloak-body text-comic-gray-dark text-sm leading-snug">
										<CheckIcon />
										<span>{f}</span>
									</li>
								))}
							</ul>
							<p className="cloak-body text-comic-gray-dark text-sm mt-3 leading-relaxed">
								Access to all Pro features without bundled AI & Speech-to-text; bring your own LLM and
								transcription providers. Recommended for developers.
							</p>
							<div className="mt-4 pt-4 border-t-2 border-comic-black/20">
								<PlanCTA variant="license" label="Get Dev Pro License" href="mailto:hvsolanki27@gmail.com?subject=Cloak%20Dev%20Pro%20License" />
							</div>
						</div>
					) : (
						<>
							{/* Limited Pro */}
							<div className="border-[3px] border-comic-black bg-comic-gray p-6 flex flex-col min-h-[380px] relative">
								<span className="absolute -top-2 left-4 px-2 py-0.5 bg-comic-black text-comic-white comic-heading text-xs">
									Most Popular
								</span>
								<h3 className="comic-heading text-xl text-comic-black mb-1 mt-2">Limited Pro</h3>
								{billingCycle === "yearly" ? (
									<>
										<p className="cloak-body text-comic-gray-dark mb-2">
											<span className="text-comic-gray-medium line-through">$180</span>{" "}
											<span className="text-2xl font-bold text-comic-black">$150</span>
											<span className="text-comic-gray-medium"> / year</span>
										</p>
										<p className="cloak-body text-xs text-comic-gray-medium mb-2">+ 2 months free (limited time offer)</p>
									</>
								) : (
									<p className="cloak-body text-comic-gray-dark mb-2">
										<span className="text-comic-gray-medium line-through">$20</span>{" "}
										<span className="text-2xl font-bold text-comic-black">$15</span>
										<span className="text-comic-gray-medium"> / month</span>
									</p>
								)}
								<span className="inline-block cloak-body text-xs text-comic-gray-medium border border-comic-black px-2 py-0.5 w-fit mb-4">
									{billingCycle === "yearly" ? "Save 17%" : "Save 25%"}
								</span>
								<ul className="flex-1 space-y-2 min-h-0">
									{LIMITED_PRO_FEATURES.map((f) => (
										<li key={f} className="flex gap-2 cloak-body text-comic-gray-dark text-sm leading-snug">
											<CheckIcon />
											<span>{f}</span>
										</li>
									))}
								</ul>
								<div className="mt-4 pt-4 border-t-2 border-comic-black/20">
									<PlanCTA variant="license" label="Get Limited Pro License" href="mailto:hvsolanki27@gmail.com?subject=Cloak%20Limited%20Pro%20License" />
								</div>
							</div>
							{/* Unlimited Pro */}
							<div className="border-[3px] border-comic-black bg-comic-gray p-6 flex flex-col min-h-[380px]">
								<h3 className="comic-heading text-xl text-comic-black mb-1">Unlimited Pro</h3>
								{billingCycle === "yearly" ? (
									<>
										<p className="cloak-body text-comic-gray-dark mb-2">
											<span className="text-comic-gray-medium line-through">$420</span>{" "}
											<span className="text-2xl font-bold text-comic-black">$350</span>
											<span className="text-comic-gray-medium"> / year</span>
										</p>
										<p className="cloak-body text-xs text-comic-gray-medium mb-2">+ 2 months free (limited time offer)</p>
									</>
								) : (
									<p className="cloak-body text-comic-gray-dark mb-2">
										<span className="text-comic-gray-medium line-through">$40</span>{" "}
										<span className="text-2xl font-bold text-comic-black">$35</span>
										<span className="text-comic-gray-medium"> / month</span>
									</p>
								)}
								<span className="inline-block cloak-body text-xs text-comic-gray-medium border border-comic-black px-2 py-0.5 w-fit mb-4">
									{billingCycle === "yearly" ? "Save 17%" : "Save 12.5%"}
								</span>
								<ul className="flex-1 space-y-2 min-h-0">
									{UNLIMITED_PRO_FEATURES.map((f) => (
										<li key={f} className="flex gap-2 cloak-body text-comic-gray-dark text-sm leading-snug">
											<CheckIcon />
											<span>{f}</span>
										</li>
									))}
								</ul>
								<div className="mt-4 pt-4 border-t-2 border-comic-black/20">
									<PlanCTA variant="license" label="Get Unlimited Pro License" href="mailto:hvsolanki27@gmail.com?subject=Cloak%20Unlimited%20Pro%20License" />
								</div>
							</div>
						</>
					)}
				</div>
			</section>

			{/* Affiliate */}
			<section className="max-w-4xl mx-auto px-4 py-12 sm:py-16" id="affiliate">
				<h2 className="comic-heading text-2xl sm:text-3xl text-comic-black mb-6">
					AFFILIATE
				</h2>
				<div className="border-[3px] border-comic-black bg-comic-gray p-6 sm:p-8">
					<p className="cloak-body text-comic-gray-dark leading-relaxed mb-4">
						Love Cloak and want to share it? We’re building an affiliate program so you can promote
						Cloak and earn when others download and use it. If you’re a creator, educator, or
						community lead and want to join, get in touch.
					</p>
					<p className="cloak-body text-base text-comic-gray-dark">
						Contact:{" "}
						<a
							href="mailto:hvsolanki27@gmail.com?subject=Cloak%20Affiliate"
							className="font-display font-bold text-comic-black hover:text-comic-yellow transition underline"
						>
							hvsolanki27@gmail.com
						</a>{" "}
						with subject “Cloak Affiliate”.
					</p>
				</div>
			</section>

			{/* Download CTA */}
			<section className="max-w-4xl mx-auto px-4 py-12 sm:py-16" id="download">
				<div className="border-[3px] border-comic-black bg-comic-yellow p-6 sm:p-8 text-center">
					<h2 className="comic-heading text-2xl sm:text-3xl text-comic-black mb-2">
						READY TO GO INVISIBLE?
					</h2>
					<p className="cloak-body text-comic-gray-dark mb-6 max-w-xl mx-auto">
						Download Cloak for macOS (Apple Silicon). Native DMG, no account required.
					</p>
					<DownloadButton label="Download Cloak for macOS" url={downloadUrl} />
					<p className="cloak-body text-xs text-comic-gray-dark mt-4">
						Latest: v{version}
						{released && ` · Released ${released}`}
					</p>
				</div>
			</section>

			{/* FAQ */}
			<section className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
				<h2 className="comic-heading text-2xl sm:text-3xl text-comic-black mb-6">
					FREQUENTLY ASKED QUESTIONS
				</h2>
				<ul className="space-y-4">
					{FAQ_ITEMS.map((item) => (
						<li key={item.q} className="border-[3px] border-comic-black bg-comic-gray p-4 sm:p-5">
							<h3 className="comic-heading text-sm text-comic-black mb-2">{item.q}</h3>
							<p className="cloak-body text-base text-comic-gray-dark leading-relaxed">{item.a}</p>
						</li>
					))}
				</ul>
			</section>

			{macosInstallDocUrl && (
				<section className="max-w-4xl mx-auto px-4 pb-16">
					<div className="border-[3px] border-comic-black bg-comic-gray p-4">
						<h3 className="comic-heading text-sm text-comic-black mb-1">macOS installation</h3>
						<p className="cloak-body text-base text-comic-gray-dark">
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

			<section className="max-w-4xl mx-auto px-4 pb-20">
				<p className="cloak-body text-base text-comic-gray-dark">
					Cloak runs on your machine: real-time transcription, call summaries, Google Calendar, and a
					knowledge base. Use your own API keys; no account required.
				</p>
			</section>
		</div>
	);
}
