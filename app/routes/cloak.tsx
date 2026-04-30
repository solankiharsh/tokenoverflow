import { useState } from "react";
import type { Route } from "./+types/cloak";
import { buildMeta } from "../lib/seo";

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

export function meta({ location }: Route.MetaArgs) {
	return buildMeta({
		fullTitle: "Cloak — Invisible AI Assistant for macOS",
		description:
			"Cloak is your invisible AI assistant for macOS — stealth in meetings, real-time transcription, and call summaries. Built with Tauri + Rust. Privacy-first, ~10 MB.",
		path: location.pathname,
		keywords: [
			"Cloak AI assistant",
			"invisible AI",
			"meeting transcription macOS",
			"AI call summary",
			"Tauri Rust app",
			"privacy AI assistant",
		],
	});
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
			rel={hasUrl ? "noopener noreferrer" : undefined}
			className={`inline-flex items-center gap-2 text-sm font-medium w-full sm:w-auto justify-center no-underline ${
				hasUrl ? "comic-btn" : "comic-btn-outline opacity-60 pointer-events-none cursor-not-allowed"
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
		<svg className="w-4 h-4 shrink-0 text-volt-green" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
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
		"w-full py-3 px-4 rounded-md border border-volt-border text-center transition flex items-center justify-center text-sm font-medium";
	if (variant === "current") {
		return (
			<button
				type="button"
				className={`${baseClass} bg-volt-carbon text-volt-steel cursor-default`}
				disabled
			>
				{label}
			</button>
		);
	}
	return (
		<a href={href ?? "#"} className={`${baseClass} comic-btn no-underline`}>
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
				className="sticky top-0 z-10 border-b border-volt-border bg-volt-abyss/95 backdrop-blur-md font-sans font-medium text-sm"
				aria-label="Cloak page"
			>
				<div className="max-w-4xl mx-auto px-4 py-3">
					<ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-start">
						{CLOAK_ANCHORS.map(({ href, label }) => (
							<li key={href}>
								<a
									href={href}
									className="text-volt-snow hover:text-volt-green transition underline decoration-2 underline-offset-2"
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
				<h1 className="comic-heading text-4xl sm:text-5xl lg:text-6xl text-volt-snow mb-4 leading-tight">
					YOUR INVISIBLE <span className="yellow-highlight">AI ASSISTANT</span>
				</h1>
				<p className="cloak-body text-lg sm:text-xl text-volt-parchment mb-6 max-w-2xl leading-relaxed">
					Cloak runs with complete stealth during meetings, interviews, and presentations. Undetectable in
					video calls, screen shares, and recordings. Built with Tauri and Rust for small size, speed,
					and privacy. Your conversations stay local; your data stays yours.
				</p>
				<div className="flex flex-wrap items-center gap-4 mb-8">
					<DownloadButton label="Download for macOS" url={downloadUrl} />
					<span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-volt-border bg-volt-green text-volt-snow font-mono text-sm font-medium">
						v{version}
					</span>
					{released && (
						<span className="text-volt-steel text-sm">Released {released}</span>
					)}
					{totalDownloads !== "0" && (
						<span className="text-volt-steel text-sm">{totalDownloads} downloads</span>
					)}
				</div>
			</section>

			{/* Why Cloak */}
			<section className="max-w-4xl mx-auto px-4 py-12 sm:py-16" id="why">
				<h2 className="comic-heading text-2xl sm:text-3xl text-volt-snow mb-6">
					WHY <span className="yellow-highlight">CLOAK</span>?
				</h2>
				<p className="cloak-body text-volt-parchment mb-8 max-w-2xl leading-relaxed">
					An AI assistant built for privacy, performance, and discretion. Enterprise-style features
					without sending your data to third-party servers.
				</p>
				<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{WHY_ITEMS.map((item) => (
						<li key={item.title} className="comic-card-hover p-5">
							<h3 className="comic-heading text-sm text-volt-snow mb-1">{item.title}</h3>
							<p className="cloak-body text-base text-volt-parchment leading-snug">{item.desc}</p>
						</li>
					))}
				</ul>
			</section>

			{/* Features */}
			<section className="max-w-4xl mx-auto px-4 py-12 sm:py-16" id="features">
				<h2 className="comic-heading text-2xl sm:text-3xl text-volt-snow mb-8">
					FEATURES
				</h2>
				<div className="space-y-8">
					<div className="border border-volt-border bg-volt-carbon p-5 sm:p-6">
						<h3 className="comic-heading text-lg text-volt-snow mb-2">Complete invisibility</h3>
						<p className="cloak-body text-base text-volt-parchment leading-relaxed">
							The overlay sits above all apps but stays invisible in Zoom, Google Meet, Microsoft
							Teams, and Slack Huddles. No one sees your assistant.
						</p>
					</div>
					<div className="border border-volt-border bg-volt-carbon p-5 sm:p-6">
						<h3 className="comic-heading text-lg text-volt-snow mb-2">System audio capture (Cmd+Shift+M)</h3>
						<p className="cloak-body text-base text-volt-parchment leading-relaxed">
							Capture system audio in real time during meetings. Speech-to-text runs with your
							chosen provider (e.g. Whisper, Groq). Voice activity detection and instant access
							via a global shortcut.
						</p>
					</div>
					<div className="border border-volt-border bg-volt-carbon p-5 sm:p-6">
						<h3 className="comic-heading text-lg text-volt-snow mb-2">Keyboard shortcuts</h3>
						<p className="cloak-body text-base text-volt-parchment leading-relaxed">
							Customizable global shortcuts: toggle window, dashboard, system audio, voice input,
							screenshot. Stay in flow without leaving your current app.
						</p>
					</div>
					<div className="border border-volt-border bg-volt-carbon p-5 sm:p-6">
						<h3 className="comic-heading text-lg text-volt-snow mb-2">Meetings & summaries</h3>
						<p className="cloak-body text-base text-volt-parchment leading-relaxed">
							Auto-save transcripts when you stop a capture. Generate summaries and keep notes
							locally. Optional Google Calendar integration.
						</p>
					</div>
					<div className="border border-volt-border bg-volt-carbon p-5 sm:p-6">
						<h3 className="comic-heading text-lg text-volt-snow mb-2">Your data stays local</h3>
						<p className="cloak-body text-base text-volt-parchment leading-relaxed">
							Cloak runs on your machine. Real-time transcription, call summaries, and knowledge
							base use your own API keys. No Cloak account, no telemetry.
						</p>
					</div>
				</div>
			</section>

			{/* Pricing */}
			<section className="max-w-4xl mx-auto px-4 py-12 sm:py-16" id="pricing">
				<h2 className="comic-heading text-2xl sm:text-3xl text-volt-snow mb-6">
					PRICING
				</h2>
				{/* Billing cycle toggle */}
				<div className="flex flex-wrap gap-2 justify-center mb-10">
					{(["one-time", "monthly", "yearly"] as const).map((cycle) => (
						<button
							key={cycle}
							type="button"
							onClick={() => setBillingCycle(cycle)}
							className={`cloak-body px-4 py-2.5 rounded-md border font-medium transition-all ${
								billingCycle === cycle
									? "border-volt-green bg-volt-carbon text-volt-mint border-2"
									: "border-volt-border bg-volt-carbon text-volt-snow hover:border-volt-green/40"
							}`}
						>
							{cycle === "one-time" ? "One Time" : cycle === "monthly" ? "Monthly" : "Yearly"}
						</button>
					))}
				</div>
				{/* Plan cards: same structure so CTAs align at bottom; PlanCTA for uniformity */}
				<div className={`grid gap-6 items-stretch ${billingCycle === "one-time" ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
					{/* Free plan (always shown) */}
					<div className="border border-volt-border bg-volt-carbon p-6 flex flex-col min-h-[380px]">
						<h3 className="comic-heading text-xl text-volt-snow mb-1">Free</h3>
						<p className="cloak-body text-volt-parchment mb-2">
							<span className="text-2xl font-bold text-volt-snow">$0</span>
							<span className="text-volt-steel"> / forever</span>
						</p>
						<span className="inline-block cloak-body text-xs text-volt-steel border border-volt-border px-2 py-0.5 w-fit mb-4">
							Save 100%
						</span>
						<ul className="flex-1 space-y-2 min-h-0">
							{FREE_FEATURES.map((f) => (
								<li key={f} className="flex gap-2 cloak-body text-volt-parchment text-sm leading-snug">
									<CheckIcon />
									<span>{f}</span>
								</li>
							))}
						</ul>
						<div className="mt-4 pt-4 border-t-2 border-volt-border/20">
							<PlanCTA variant="current" label="Current Plan" />
						</div>
					</div>

					{billingCycle === "one-time" ? (
						/* Dev Pro (one-time only) */
						<div className="border border-volt-border bg-volt-carbon p-6 flex flex-col min-h-[380px]">
							<h3 className="comic-heading text-xl text-volt-snow mb-1">Dev Pro</h3>
							<p className="cloak-body text-volt-parchment mb-2">
								<span className="text-volt-steel line-through">$150</span>{" "}
								<span className="text-2xl font-bold text-volt-snow">$120</span>
								<span className="text-volt-steel"> / forever</span>
							</p>
							<span className="inline-block cloak-body text-xs text-volt-steel border border-volt-border px-2 py-0.5 w-fit mb-4">
								Save 20% (limited time offer)
							</span>
							<ul className="flex-1 space-y-2 min-h-0">
								{DEV_PRO_FEATURES.map((f) => (
									<li key={f} className="flex gap-2 cloak-body text-volt-parchment text-sm leading-snug">
										<CheckIcon />
										<span>{f}</span>
									</li>
								))}
							</ul>
							<p className="cloak-body text-volt-parchment text-sm mt-3 leading-relaxed">
								Access to all Pro features without bundled AI & Speech-to-text; bring your own LLM and
								transcription providers. Recommended for developers.
							</p>
							<div className="mt-4 pt-4 border-t-2 border-volt-border/20">
								<PlanCTA variant="license" label="Get Dev Pro License" href="mailto:hvsolanki27@gmail.com?subject=Cloak%20Dev%20Pro%20License" />
							</div>
						</div>
					) : (
						<>
							{/* Limited Pro */}
							<div className="border border-volt-border bg-volt-carbon p-6 flex flex-col min-h-[380px] relative">
								<span className="absolute -top-2 left-4 px-2 py-0.5 rounded-md bg-volt-green text-volt-abyss text-xs font-semibold tracking-wide uppercase">
									Most Popular
								</span>
								<h3 className="comic-heading text-xl text-volt-snow mb-1 mt-2">Limited Pro</h3>
								{billingCycle === "yearly" ? (
									<>
										<p className="cloak-body text-volt-parchment mb-2">
											<span className="text-volt-steel line-through">$180</span>{" "}
											<span className="text-2xl font-bold text-volt-snow">$150</span>
											<span className="text-volt-steel"> / year</span>
										</p>
										<p className="cloak-body text-xs text-volt-steel mb-2">+ 2 months free (limited time offer)</p>
									</>
								) : (
									<p className="cloak-body text-volt-parchment mb-2">
										<span className="text-volt-steel line-through">$20</span>{" "}
										<span className="text-2xl font-bold text-volt-snow">$15</span>
										<span className="text-volt-steel"> / month</span>
									</p>
								)}
								<span className="inline-block cloak-body text-xs text-volt-steel border border-volt-border px-2 py-0.5 w-fit mb-4">
									{billingCycle === "yearly" ? "Save 17%" : "Save 25%"}
								</span>
								<ul className="flex-1 space-y-2 min-h-0">
									{LIMITED_PRO_FEATURES.map((f) => (
										<li key={f} className="flex gap-2 cloak-body text-volt-parchment text-sm leading-snug">
											<CheckIcon />
											<span>{f}</span>
										</li>
									))}
								</ul>
								<div className="mt-4 pt-4 border-t-2 border-volt-border/20">
									<PlanCTA variant="license" label="Get Limited Pro License" href="mailto:hvsolanki27@gmail.com?subject=Cloak%20Limited%20Pro%20License" />
								</div>
							</div>
							{/* Unlimited Pro */}
							<div className="border border-volt-border bg-volt-carbon p-6 flex flex-col min-h-[380px]">
								<h3 className="comic-heading text-xl text-volt-snow mb-1">Unlimited Pro</h3>
								{billingCycle === "yearly" ? (
									<>
										<p className="cloak-body text-volt-parchment mb-2">
											<span className="text-volt-steel line-through">$420</span>{" "}
											<span className="text-2xl font-bold text-volt-snow">$350</span>
											<span className="text-volt-steel"> / year</span>
										</p>
										<p className="cloak-body text-xs text-volt-steel mb-2">+ 2 months free (limited time offer)</p>
									</>
								) : (
									<p className="cloak-body text-volt-parchment mb-2">
										<span className="text-volt-steel line-through">$40</span>{" "}
										<span className="text-2xl font-bold text-volt-snow">$35</span>
										<span className="text-volt-steel"> / month</span>
									</p>
								)}
								<span className="inline-block cloak-body text-xs text-volt-steel border border-volt-border px-2 py-0.5 w-fit mb-4">
									{billingCycle === "yearly" ? "Save 17%" : "Save 12.5%"}
								</span>
								<ul className="flex-1 space-y-2 min-h-0">
									{UNLIMITED_PRO_FEATURES.map((f) => (
										<li key={f} className="flex gap-2 cloak-body text-volt-parchment text-sm leading-snug">
											<CheckIcon />
											<span>{f}</span>
										</li>
									))}
								</ul>
								<div className="mt-4 pt-4 border-t-2 border-volt-border/20">
									<PlanCTA variant="license" label="Get Unlimited Pro License" href="mailto:hvsolanki27@gmail.com?subject=Cloak%20Unlimited%20Pro%20License" />
								</div>
							</div>
						</>
					)}
				</div>
			</section>

			{/* Affiliate */}
			<section className="max-w-4xl mx-auto px-4 py-12 sm:py-16" id="affiliate">
				<h2 className="comic-heading text-2xl sm:text-3xl text-volt-snow mb-6">
					AFFILIATE
				</h2>
				<div className="border border-volt-border bg-volt-carbon p-6 sm:p-8">
					<p className="cloak-body text-volt-parchment leading-relaxed mb-4">
						Love Cloak and want to share it? We’re building an affiliate program so you can promote
						Cloak and earn when others download and use it. If you’re a creator, educator, or
						community lead and want to join, get in touch.
					</p>
					<p className="cloak-body text-base text-volt-parchment">
						Contact:{" "}
						<a
							href="mailto:hvsolanki27@gmail.com?subject=Cloak%20Affiliate"
							className="font-display font-bold text-volt-snow hover:text-volt-green transition underline"
						>
							hvsolanki27@gmail.com
						</a>{" "}
						with subject “Cloak Affiliate”.
					</p>
				</div>
			</section>

			{/* Download CTA */}
			<section className="max-w-4xl mx-auto px-4 py-12 sm:py-16" id="download">
				<div className="border border-volt-border bg-volt-green p-6 sm:p-8 text-center">
					<h2 className="comic-heading text-2xl sm:text-3xl text-volt-snow mb-2">
						READY TO GO INVISIBLE?
					</h2>
					<p className="cloak-body text-volt-parchment mb-6 max-w-xl mx-auto">
						Download Cloak for macOS (Apple Silicon). Native DMG, no account required.
					</p>
					<DownloadButton label="Download Cloak for macOS" url={downloadUrl} />
					<p className="cloak-body text-xs text-volt-parchment mt-4">
						Latest: v{version}
						{released && ` · Released ${released}`}
					</p>
				</div>
			</section>

			{/* FAQ */}
			<section className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
				<h2 className="comic-heading text-2xl sm:text-3xl text-volt-snow mb-6">
					FREQUENTLY ASKED QUESTIONS
				</h2>
				<ul className="space-y-4">
					{FAQ_ITEMS.map((item) => (
						<li key={item.q} className="border border-volt-border bg-volt-carbon p-4 sm:p-5">
							<h3 className="comic-heading text-sm text-volt-snow mb-2">{item.q}</h3>
							<p className="cloak-body text-base text-volt-parchment leading-relaxed">{item.a}</p>
						</li>
					))}
				</ul>
			</section>

			{macosInstallDocUrl && (
				<section className="max-w-4xl mx-auto px-4 pb-16">
					<div className="border border-volt-border bg-volt-carbon p-4">
						<h3 className="comic-heading text-sm text-volt-snow mb-1">macOS installation</h3>
						<p className="cloak-body text-base text-volt-parchment">
							If you run into installation issues on macOS, see our{" "}
							<a
								href={macosInstallDocUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="font-display font-bold text-volt-snow hover:text-volt-green transition underline"
							>
								step-by-step guide
							</a>{" "}
							to resolve common problems.
						</p>
					</div>
				</section>
			)}

			<section className="max-w-4xl mx-auto px-4 pb-20">
				<p className="cloak-body text-base text-volt-parchment">
					Cloak runs on your machine: real-time transcription, call summaries, Google Calendar, and a
					knowledge base. Use your own API keys; no account required.
				</p>
			</section>
		</div>
	);
}
