import { useState } from "react";
import type { Route } from "./+types/about";
import { extracurriculars } from "../data/extracurriculars";
import { buildMeta } from "../lib/seo";

/** Returns embed URL for YouTube or Vimeo, or null if unsupported. */
function getVideoEmbedUrl(url: string): string | null {
	try {
		const u = new URL(url);
		if (u.hostname === "www.youtube.com" && u.searchParams.get("v")) {
			return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
		}
		if (u.hostname === "youtu.be" && u.pathname.slice(1)) {
			return `https://www.youtube.com/embed/${u.pathname.slice(1).split("?")[0]}`;
		}
		if (u.hostname === "vimeo.com" && u.pathname) {
			const id = u.pathname.replace(/^\/+/, "").split("/")[0];
			if (id) return `https://player.vimeo.com/video/${id}`;
		}
	} catch {
		// ignore
	}
	return null;
}

const TECH = [
	"Python",
	"AWS",
	"GCP",
	"React",
	"FastAPI",
	"RAG",
	"LangChain",
	"Vertex AI",
	"TensorFlow",
	"PyTorch",
	"MLflow",
	"Kafka",
	"Trino",
	"Iceberg",
];

type TargetPillar = {
	id: string;
	label: string;
	tagline: string;
	metric: string;
	blurb: string;
	tech: string[];
	bullets: string[];
};

const TARGET_PILLARS: TargetPillar[] = [
	{
		id: "feature-store",
		label: "Feature Store",
		tagline: "In-house feature management for ~400 DS",
		metric: "6 weeks → 1 week onboarding",
		blurb:
			"Rebuilt the Feature Management SDK and onboarding flow so a Data Scientist could declare a feature in one call and ship to production in a week — without skipping a single governance gate.",
		tech: ["Python", "Trino", "Iceberg", "Parquet", "Shepherd", "GE"],
		bullets: [
			"Collapsed `create_featureset` to a single contract covering source, entity keys, timestamps, freshness SLA, PII tier, retention.",
			"Converted the call to async Shepherd-orchestrated pipelines across Data Placement, Feature Management, Governance, and Observability APIs.",
			"Inline Great Expectations checks short-circuited bad features with concrete, actionable errors.",
			"Emitted lineage events to Lasso — substrate for auto-deprecation and downstream governance.",
		],
	},
	{
		id: "kaas",
		label: "Kernels-as-a-Service",
		tagline: "Patented polymorphic compute for Jupyter",
		metric: "92% → 99.5% kernel-start success",
		blurb:
			"Productionized KaaS — Target's patented notebook platform (US 2023/0229438 A1) — with custom ProcessProxies, cross-substrate auth, and cell-level caching. On the team, not on the patent.",
		tech: ["Jupyter", "JEG", "YARN", "K8s", "Ray", "Argus"],
		bullets: [
			"Designed the `X-Tgt-Access-Token` header + TokenRefresher pattern so long-lived kernels stayed authenticated as the user across a ~4-hour token lifetime.",
			"Hardened ArgusProcessProxy: exponential backoff, Kerberos renewal, multi-VLM routing, graceful shutdown during upgrades.",
			"Shipped cell-granular cache-key derivation — 62% hit rate, p50 re-run dropped 8m → 1.5m, DS NPS +15 → +38 in one quarter.",
			"Owned the kernel-image governance lifecycle and the pinned-image escape hatch for production-critical workloads.",
		],
	},
	{
		id: "mlflow",
		label: "MLflow + Deployment",
		tagline: "Event-driven model delivery on TargetML",
		metric: "1–3 days → ~15 min to production",
		blurb:
			"Wrapped MLflow with Target's identity, governance, and deployment stack — `mlflow-target` plugin, Vela deployment plugins, lineage coupling, and the `targetml.yml` DS contract.",
		tech: ["MLflow", "Kafka", "Vela", "Postgres", "Artifactory"],
		bullets: [
			"SSO + AD-group auth, model-card enforcement, and approval chains in the mlflow-target plugin library.",
			"Kafka-driven Vela deployments with canary rollout + auto-rollback across SCA, TAP, Shepherd, and Argus.",
			"Auto feature→model lineage into MLflow runs — a regulator audit that would have taken weeks closed in 20 minutes.",
			"Layered `targetml.yml` schema supporting Level 1 / 2 / 3 interaction flows for different DS ownership preferences.",
		],
	},
	{
		id: "substrate",
		label: "Shared Substrate",
		tagline: "Why three surfaces felt like one platform",
		metric: "one auth model, three product surfaces",
		blurb:
			"Lasso (event ledger) + Shepherd (orchestration) + a unified auth model stitched Feature Store, KaaS, and MLflow into one coherent platform.",
		tech: ["Lasso", "Shepherd", "OAuth2", "AD", "Kafka"],
		bullets: [
			"Same `X-Tgt-Access-Token` propagation worked from notebooks, SDK calls, and Vela builds — every action audit-traceable to a user or service principal.",
			"Shepherd routed workloads across BigRed3 (YARN), SCA (K8s), TAP, and GCP Vertex from a single contract.",
			"One lineage graph: feature → training run → model version → deployment → drift monitor.",
		],
	},
];

export function meta({ location }: Route.MetaArgs) {
	return buildMeta({
		title: "About — Engineering Lead, Applied AI",
		description:
			"Harsh Solanki — Engineering Lead, Applied AI at Deriv. 9+ years in ML platform work: feature stores, Kernels-as-a-Service, MLflow. 3× AWS certified, UChicago PGP DS&ML.",
		path: location.pathname,
		type: "profile",
		keywords: [
			"Harsh Solanki about",
			"AI engineering lead",
			"ML platform engineer",
			"Target ML platform",
			"Deriv AI",
			"feature store",
			"MLflow",
			"Kernels-as-a-Service",
		],
	});
}

export default function About() {
	const [activePillar, setActivePillar] = useState<string>(TARGET_PILLARS[0].id);
	const pillar = TARGET_PILLARS.find((p) => p.id === activePillar)!;

	return (
		<div className="max-w-3xl mx-auto px-4 py-12">
			<pre className="font-mono text-xs text-volt-steel mb-2">
				~/$ cat about.md
			</pre>
			<h1 className="comic-heading text-3xl text-volt-snow mb-6">
				ABOUT
			</h1>
			<div className="space-y-6 text-volt-snow">
				<p className="font-mono text-lg text-volt-parchment">
					Building AI products until they learn to build themselves.
				</p>
				<p className="text-volt-steel leading-relaxed">
					Engineering Lead — Applied AI at Deriv (Dubai). 9+ years, four of
					them inside Target's ML Platform — feature store, Kernels-as-a-Service
					notebook platform, MLflow, and model delivery. 3× AWS certified.
					Educator. Professional introvert who thrives on writing to learn
					and questioning existing processes. Into RAG, MLOps, and C-level
					dashboards that actually make sense.
				</p>
				<section className="border border-volt-border p-5 bg-volt-carbon" id="ai-impact">
					<figure className="m-0">
						<img
							src="/harsh-solanki-ai-leadership-infographic.png"
							alt="Harsh Solanki: Driving AI Innovation & Leadership at Deriv — Strategic AI Product Leadership (6+ revenue-generating products including Nexus, Site Sense, SponsorFlow; 7-person engineering team; high-velocity workflows, compliance, product leads) and Community Engagement & AI Advocacy (300+ AI Talent Sprint participants, Everyday AI global workshops in Dubai and Jordan, global hackathon mentorship with lablab.ai)"
							className="w-full h-auto rounded border border-volt-border"
							loading="lazy"
							width={1200}
							height={675}
						/>
						<figcaption className="comic-heading text-xs mt-2 text-volt-steel text-center">
							AI leadership & impact at Deriv — product, team, and community.
						</figcaption>
					</figure>
				</section>
				<section className="border border-volt-border p-5 bg-volt-carbon">
					<h2 className="comic-heading text-sm mb-2 text-volt-snow">
						$ git log --oneline
					</h2>
					<ul className="space-y-1 text-sm text-volt-steel font-mono">
						<li>Deriv — Engineering Lead, Applied AI (current)</li>
						<li>Target — Senior → Lead ML Platform Engineer</li>
						<li>Quantiphi — ML Engineer</li>
						<li>Amazon — Business Analyst</li>
						<li>UChicago Graham School — PGP Data Science &amp; ML</li>
					</ul>
				</section>

				{/* Target ML Platform — interactive pillars */}
				<section
					className="border border-volt-border p-5 bg-volt-carbon"
					id="target"
				>
					<div className="flex items-baseline justify-between gap-4 flex-wrap mb-1">
						<h2 className="comic-heading text-sm text-volt-snow">
							$ cd target/ml-platform &amp;&amp; ls
						</h2>
						<span className="font-mono text-[11px] text-volt-steel">
							4 years · ~400 DS · hybrid on-prem + GCP
						</span>
					</div>
					<p className="text-xs text-volt-steel mb-4 leading-relaxed">
						Four product surfaces over one substrate. Pick a pillar to see the
						scope.
					</p>

					<div
						role="tablist"
						aria-label="Target ML Platform pillars"
						className="flex flex-wrap gap-2 mb-5"
					>
						{TARGET_PILLARS.map((p) => {
							const isActive = p.id === activePillar;
							return (
								<button
									key={p.id}
									type="button"
									role="tab"
									aria-selected={isActive}
									aria-controls={`pillar-panel-${p.id}`}
									id={`pillar-tab-${p.id}`}
									onClick={() => setActivePillar(p.id)}
									className={`font-mono text-[11px] px-3 py-1.5 rounded border transition-colors ${
										isActive
											? "border-volt-green/60 text-volt-mint bg-black/30"
											: "border-volt-border text-volt-steel hover:text-volt-snow hover:border-volt-green/30"
									}`}
								>
									{p.label}
								</button>
							);
						})}
					</div>

					<div
						key={pillar.id}
						role="tabpanel"
						id={`pillar-panel-${pillar.id}`}
						aria-labelledby={`pillar-tab-${pillar.id}`}
						className="space-y-4 landing-animate-in"
					>
						<div className="flex flex-col gap-1">
							<div className="flex items-baseline justify-between gap-4 flex-wrap">
								<h3 className="comic-heading text-base text-volt-snow">
									{pillar.tagline}
								</h3>
								<span className="font-mono text-[11px] text-volt-mint">
									{pillar.metric}
								</span>
							</div>
							<p className="text-sm text-volt-parchment leading-relaxed">
								{pillar.blurb}
							</p>
						</div>
						<ul className="space-y-2 text-sm text-volt-steel">
							{pillar.bullets.map((b, i) => (
								<li key={i} className="flex gap-3 leading-relaxed">
									<span
										className="text-volt-green select-none font-mono mt-0.5"
										aria-hidden
									>
										›
									</span>
									<span
										// biome-ignore lint/security/noDangerouslySetInnerHtml: trusted local content
										dangerouslySetInnerHTML={{
											__html: b.replace(
												/`([^`]+)`/g,
												'<code class="font-mono text-[0.8rem] px-1 py-0.5 rounded bg-black/40 border border-volt-border text-volt-mint">$1</code>',
											),
										}}
									/>
								</li>
							))}
						</ul>
						<div className="flex flex-wrap gap-1.5 pt-1">
							{pillar.tech.map((t) => (
								<span
									key={t}
									className="font-mono text-[10px] px-2 py-0.5 rounded border border-volt-border text-volt-steel"
								>
									{t}
								</span>
							))}
						</div>
					</div>
				</section>

				<section className="border border-volt-border p-5 bg-volt-carbon">
					<h2 className="comic-heading text-sm mb-2 text-volt-snow">
						$ ls certs/
					</h2>
					<p className="text-sm text-volt-steel">
						3× AWS (Solutions Architect, ML Specialty, Data Analytics), UChicago
						PGP Data Science &amp; Machine Learning.
					</p>
				</section>
				<section className="border border-volt-border p-5 bg-volt-carbon">
					<h2 className="comic-heading text-sm mb-2 text-volt-snow">
						$ echo $TECH
					</h2>
					<div className="flex flex-wrap gap-2">
						{TECH.map((t) => (
							<span
								key={t}
								className="font-mono text-xs px-2 py-1 rounded-md border border-volt-green/40 bg-volt-carbon text-volt-mint font-medium"
							>
								{t}
							</span>
						))}
					</div>
				</section>
				<section className="border border-volt-border p-5 bg-volt-carbon" id="extracurriculars">
					<h2 className="comic-heading text-sm mb-4 text-volt-snow">
						$ cat extracurriculars.md
					</h2>
					<p className="text-xs text-volt-steel mb-4">
						Speaking, workshops, and beyond.
					</p>
					<ul className="space-y-8">
						{extracurriculars.map((item, i) => (
							<li key={i} className="space-y-3">
								<div className="font-mono text-sm font-medium text-volt-snow">
									{item.href ? (
										<a
											href={item.href}
											target="_blank"
											rel="noopener noreferrer"
											className="hover:text-volt-green transition underline"
										>
											{item.title}
										</a>
									) : (
										item.title
									)}
								</div>
								{item.date && (
									<p className="text-xs text-volt-parchment font-mono">{item.date}</p>
								)}
								{item.image && (
									<figure className="m-0">
										<img
											src={item.image}
											alt={item.title}
											className="w-full max-w-md h-auto rounded border border-volt-border"
											loading="lazy"
											decoding="async"
											width={1200}
											height={675}
										/>
									</figure>
								)}
								{item.videoUrl && getVideoEmbedUrl(item.videoUrl) && (
									<div className="aspect-video w-full max-w-lg rounded-lg border border-volt-border overflow-hidden bg-volt-abyss">
										<iframe
											title={`Video: ${item.title}`}
											src={getVideoEmbedUrl(item.videoUrl)!}
											className="w-full h-full"
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
											allowFullScreen
										/>
									</div>
								)}
								{item.description && (
									<p className="text-sm text-volt-steel leading-relaxed">
										{item.description}
									</p>
								)}
							</li>
						))}
					</ul>
				</section>
				<p className="font-mono text-sm text-volt-parchment pt-4">
					Want to talk embeddings?{" "}
					<a href="#subscribe" className="font-display font-bold text-volt-snow hover:text-volt-green transition underline">
						Drop a line
					</a>
					.
				</p>
			</div>
		</div>
	);
}
