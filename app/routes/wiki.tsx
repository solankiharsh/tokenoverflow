import { useEffect, useState } from "react";
import type { Route } from "./+types/wiki";
import { buildMeta } from "../lib/seo";

export function meta({ location }: Route.MetaArgs) {
	return buildMeta({
		fullTitle: "wiki · private",
		description:
			"Personal reference — not indexed, not linked from the main nav.",
		path: location.pathname,
		noindex: true,
	});
}

type Section = {
	id: string;
	label: string;
	group: string;
};

const SECTIONS: Section[] = [
	{ id: "overview", label: "TL;DR", group: "Intro" },
	{ id: "platform", label: "ML Platform (30k ft)", group: "Intro" },

	{ id: "fs-architecture", label: "Architecture", group: "Feature Store" },
	{ id: "fs-ownership", label: "What I owned", group: "Feature Store" },
	{ id: "fs-stars", label: "STARs", group: "Feature Store" },

	{ id: "kaas-architecture", label: "Architecture", group: "KaaS" },
	{ id: "kaas-ownership", label: "What I owned", group: "KaaS" },
	{ id: "kaas-stars", label: "STARs", group: "KaaS" },

	{ id: "mlflow-architecture", label: "Architecture", group: "MLflow" },
	{ id: "mlflow-ownership", label: "What I owned", group: "MLflow" },
	{ id: "mlflow-stars", label: "STARs", group: "MLflow" },

	{ id: "seams", label: "How they connect", group: "Substrate" },
	{ id: "industry", label: "Industry comparisons", group: "Substrate" },
	{ id: "memorize", label: "Memorized one-liners", group: "Substrate" },
];

export default function Wiki() {
	const [active, setActive] = useState<string>(SECTIONS[0].id);

	useEffect(() => {
		const handler = () => {
			const viewportMid = window.innerHeight / 3;
			let current = SECTIONS[0].id;
			for (const s of SECTIONS) {
				const el = document.getElementById(s.id);
				if (!el) continue;
				const top = el.getBoundingClientRect().top;
				if (top - viewportMid <= 0) current = s.id;
			}
			setActive(current);
		};
		handler();
		window.addEventListener("scroll", handler, { passive: true });
		return () => window.removeEventListener("scroll", handler);
	}, []);

	const groups = Array.from(new Set(SECTIONS.map((s) => s.group)));

	return (
		<div className="bg-volt-abyss text-volt-snow min-h-screen">
			<div className="max-w-6xl mx-auto px-4 py-10">
				{/* Header */}
				<div className="flex items-baseline justify-between gap-4 flex-wrap mb-8">
					<div>
						<pre className="font-mono text-xs text-volt-steel mb-1">
							~/$ cat wiki/target.md
						</pre>
						<h1 className="comic-heading text-3xl text-volt-snow">
							wiki · private reference
						</h1>
						<p className="text-sm text-volt-steel mt-2 max-w-2xl leading-relaxed">
							Personal notes on Target's ML Platform work. Not linked from the
							main nav, not indexed. For my own recall.
						</p>
					</div>
					<span className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt-purple border border-volt-border px-2 py-1 rounded">
						noindex · unlisted
					</span>
				</div>

				<div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-10">
					{/* Sidebar TOC */}
					<aside className="hidden lg:block">
						<nav className="sticky top-20 space-y-5 pb-10">
							{groups.map((group) => (
								<div key={group}>
									<p className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt-steel mb-2">
										{group}
									</p>
									<ul className="space-y-1">
										{SECTIONS.filter((s) => s.group === group).map((s) => (
											<li key={s.id}>
												<a
													href={`#${s.id}`}
													className={`block font-mono text-[12px] px-2 py-1 rounded border-l-2 transition-colors ${
														active === s.id
															? "border-volt-green text-volt-mint bg-black/30"
															: "border-transparent text-volt-parchment hover:text-volt-snow hover:border-volt-border"
													}`}
												>
													{s.label}
												</a>
											</li>
										))}
									</ul>
								</div>
							))}
						</nav>
					</aside>

					{/* Content */}
					<article className="max-w-3xl space-y-14">
						<SectionOverview />
						<SectionPlatform />

						<GroupHeading title="Feature Store" />
						<SectionFSArchitecture />
						<SectionFSOwnership />
						<SectionFSStars />

						<GroupHeading title="Kernels-as-a-Service" />
						<SectionKaasArchitecture />
						<SectionKaasOwnership />
						<SectionKaasStars />

						<GroupHeading title="MLflow + Deployment" />
						<SectionMLflowArchitecture />
						<SectionMLflowOwnership />
						<SectionMLflowStars />

						<GroupHeading title="Substrate · Industry · Scripts" />
						<SectionSeams />
						<SectionIndustry />
						<SectionMemorize />
					</article>
				</div>
			</div>
		</div>
	);
}

function GroupHeading({ title }: { title: string }) {
	return (
		<div className="pt-4">
			<p className="font-mono text-[10px] uppercase tracking-[0.3em] text-volt-steel border-t border-volt-border pt-6">
				{title}
			</p>
		</div>
	);
}

function Section({
	id,
	title,
	children,
}: {
	id: string;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section id={id} className="scroll-mt-20 space-y-4">
			<h2 className="comic-heading text-2xl text-volt-snow">{title}</h2>
			{children}
		</section>
	);
}

function Frame({ children }: { children: React.ReactNode }) {
	return (
		<div className="border border-volt-border rounded bg-volt-carbon p-5 text-sm text-volt-parchment leading-relaxed space-y-3">
			{children}
		</div>
	);
}

function Ascii({ children }: { children: string }) {
	return (
		<pre className="text-[11px] leading-[1.35] font-mono text-volt-mint bg-black/50 border border-volt-border rounded p-4 overflow-x-auto">
			{children}
		</pre>
	);
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
	return (
		<div className="flex gap-3 text-sm">
			<span className="font-mono text-[11px] uppercase tracking-wider text-volt-steel w-28 shrink-0 pt-0.5">
				{k}
			</span>
			<span className="text-volt-parchment leading-relaxed">{v}</span>
		</div>
	);
}

function Bullets({ items }: { items: string[] }) {
	return (
		<ul className="space-y-2">
			{items.map((b, i) => (
				<li
					key={i}
					className="flex gap-3 text-sm text-volt-parchment leading-relaxed"
				>
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
	);
}

function StarCard({
	title,
	situation,
	task,
	actions,
	result,
	bridge,
}: {
	title: string;
	situation: string;
	task: string;
	actions: string[];
	result: string[];
	bridge?: string;
}) {
	return (
		<div className="border border-volt-border rounded bg-volt-carbon p-5 space-y-3">
			<h3 className="comic-heading text-base text-volt-snow">{title}</h3>
			<KV k="Situation" v={situation} />
			<KV k="Task" v={task} />
			<div>
				<p className="font-mono text-[11px] uppercase tracking-wider text-volt-steel mb-2">
					Action
				</p>
				<Bullets items={actions} />
			</div>
			<div>
				<p className="font-mono text-[11px] uppercase tracking-wider text-volt-steel mb-2">
					Result
				</p>
				<Bullets items={result} />
			</div>
			{bridge && (
				<div className="border-l-2 border-volt-purple/50 pl-3 text-sm text-volt-steel italic">
					GYG bridge — {bridge}
				</div>
			)}
		</div>
	);
}

/* ============================================================
 * INTRO
 * ============================================================ */

function SectionOverview() {
	return (
		<Section id="overview" title="TL;DR — the 30-second framing">
			<Frame>
				<p>
					<span className="text-volt-snow">Target, 4 years.</span> Senior →
					Lead ML Platform Engineer on the in-house ML Platform used by ~400
					data scientists across pricing, recommendations, fulfillment,
					merchandising, supply chain, and fraud.
				</p>
				<p>
					Three product surfaces, one substrate:{" "}
					<span className="text-volt-mint">Feature Store</span>,{" "}
					<span className="text-volt-mint">Kernels-as-a-Service</span>{" "}
					(patented as US 2023/0229438 A1 — team member, not inventor), and{" "}
					<span className="text-volt-mint">MLflow + TargetML deployment</span>.
					Glued together by Lasso (event ledger), Shepherd (orchestrator), and
					a unified auth model.
				</p>
				<p>
					Hybrid substrate — BigRed3 (on-prem YARN), SCA / TAP (K8s), GCP
					Vertex + Dataproc. Trino + Iceberg + Parquet for analytical data.
					Kafka for events. Vela for CI/CD.
				</p>
			</Frame>
		</Section>
	);
}

function SectionPlatform() {
	return (
		<Section id="platform" title="ML Platform — 30,000 ft">
			<Frame>
				<p>
					Seven-layer-ish shape: DS-facing surfaces on top, control plane in
					the middle, compute and storage below, observability wrapping the
					whole thing.
				</p>
			</Frame>
			<Ascii>{`┌──────────────────────────────────────────────────────────────┐
│ DS-FACING SURFACE                                            │
│  Feature Mgmt SDK · Feature UI · KaaS Notebooks · MLflow UI  │
└──────────────────────────────┬───────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────┐
│ CONTROL PLANE                                                │
│  Registry · Shepherd (orchestrator) · Lasso (event ledger)   │
│  targetml.yml (DS contract) · Vela (CI/CD) · Kafka (events)  │
└──────────────────────────────┬───────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────┐
│ COMPUTE                                                      │
│  BigRed3 / YARN · SCA (K8s) · TAP · GCP Vertex / Dataproc    │
│  Argus API · TAP API · Ray / GPU pools                       │
└──────────────────────────────┬───────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────┐
│ STORAGE                                                      │
│  Trino + Iceberg over BR3 / TOSS / HDFS / BeeGFS / Ozone     │
│  Postgres · Druid · Redis · Cassandra (online serving)       │
└──────────────────────────────────────────────────────────────┘`}</Ascii>
		</Section>
	);
}

/* ============================================================
 * FEATURE STORE
 * ============================================================ */

function SectionFSArchitecture() {
	return (
		<Section id="fs-architecture" title="Feature Store — architecture">
			<Frame>
				<p>
					Three tiers: user enablement (SDK + UI), services (Data Placement,
					Feature Management, Feature Governance, Feature Observability), and
					a storage tier split between distributed offline lakes and an online
					serving layer.
				</p>
			</Frame>
			<Ascii>{`                 ┌──────────────────────────────────────────┐
TIER 1           │ Feature Management SDK  ·  Feature UI    │
User Enablement  └──────────────────┬───────────────────────┘
                                    │
                 ┌──────────────────▼───────────────────────┐
TIER 2           │ Data Placement API · Feature Mgmt API    │
Services         │ Feature Governance API · Observability   │
                 └──────────────────┬───────────────────────┘
                                    │
                 ┌──────────────────▼───────────────────────┐
TIER 3           │ Distributed offline lakes (Iceberg/Parq) │
Storage          │ Online store: HDFS / TOSS / Cassandra /  │
                 │                Redis / Kafka             │
                 └──────────────────┬───────────────────────┘
                                    │
                 ┌──────────────────▼───────────────────────┐
Substrate        │ Trino · BR3 · TOSS · HDFS · Ozone · BeeGFS│
                 │ Apache Ranger · Shepherd · Lasso · Argus │
                 └──────────────────────────────────────────┘`}</Ascii>
			<Frame>
				<p className="text-sm">
					<span className="text-volt-snow">User engagement flow.</span> DS
					defines feature params via SDK → Feature Mgmt services orchestrate
					query against the analytical platform → distribute data to lake at
					the required granularity → emit profiling/quality/drift events →
					publish location + availability. At training time SDK fetches feature
					files into model memory. Observability + Governance run quietly under
					the hood.
				</p>
			</Frame>
		</Section>
	);
}

function SectionFSOwnership() {
	return (
		<Section id="fs-ownership" title="Feature Store — what I owned">
			<Frame>
				<Bullets
					items={[
						"Feature Management SDK — the `create_featureset` contract, `get_training_dataframe` path, schema + PII metadata encoding, async job handles.",
						"Onboarding flow — collapsed from weeks of ticketing across Data Placement / Feature Mgmt / Governance / Observability teams to a single declarative call.",
						"Online serving tier migration work — contributed to evaluation and migration touchpoints when the online store tech was being re-assessed (Cassandra → lower-latency option).",
						"Feature-store ↔ Model-store integration — SDK emits lineage into MLflow runs (see MLflow STAR 3).",
						"Retroactive backfill job — Lasso-driven analysis that populated lineage for ~85% of pre-existing runs.",
					]}
				/>
			</Frame>
		</Section>
	);
}

function SectionFSStars() {
	return (
		<Section id="fs-stars" title="Feature Store — STAR stories">
			<StarCard
				title="STAR 1 — Collapsing feature onboarding from 6 weeks to 1"
				situation="Prototype SDK existed. Onboarding a new feature took 4–6 weeks across schema review, PII classification, storage-tier decision, Governance wiring, and Observability setup. Every one was a separate team ticket."
				task="Collapse onboarding to 1 week while preserving every governance gate."
				actions={[
					"Redesigned `create_featureset` to accept source query, entity keys, event-timestamp, freshness SLA, PII tier, retention — one call, no downstream tickets.",
					"Converted to async execution returning a `FeaturesetJob` handle; Shepherd pipeline fanned out to Data Placement, Feature Mgmt, Governance, and Observability APIs.",
					"Inline GE schema + null-rate checks with structured failures: `FAILED_PERMANENT: schema-validation: column 'qty' has 18% nulls (threshold: 5%)`.",
					"Lineage emission as a first-class DAG step — source hash, schema, row count, validation, compute, cost → Lasso.",
					"Hardened Shepherd's Argus API integration for YARN container failures + retry semantics alongside SRE.",
				]}
				result={[
					"Time-to-production: 4–6 weeks → ~1 week with zero gates skipped.",
					"DS self-service remediation eliminated most support tickets; platform team freed for architectural work.",
					"Feature Governance could finally run automated deprecation analyses using the Lasso lineage.",
				]}
				bridge="Tecton's `StreamFeatureView` + control-plane model is architecturally the same as our `create_featureset` + Data Placement. First month Q: does GYG have an equivalent declarative one-call path, or is onboarding still ticket-driven?"
			/>

			<StarCard
				title="STAR 2 — Online serving migration (Cassandra → lower-latency)"
				situation="Online serving tier had grown up organically with Cassandra as the working default. P99 latency + infra cost both under pressure as serving volumes scaled. Several teams had started carrying their own per-team caches on top, fragmenting the serving surface."
				task="Drive the evaluation + migration plan for an online serving tier that would hold P99 < 10ms, reduce infra cost, and not break silent consumers."
				actions={[
					"Benchmarked candidate backends against Target's actual read patterns (point lookups by entity key, short TTL, batched multi-entity reads).",
					"Planned the migration with the 'silent users are real users' rule — audited every consumer via Shepherd job-owner mappings before flipping.",
					"Shadow-read phase: every online read hit both backends, compared results, surfaced divergences to owners for 2 weeks.",
					"Per-team cutover with rollback script; left pinned-Cassandra entries for regulated workloads that needed extra diligence.",
				]}
				result={[
					"P99 read latency materially reduced across the top 10 consumers; several teams retired their bespoke caches.",
					"Infra footprint reduced (estimate-quality number, exact % lived on an internal doc).",
					"Zero silent-consumer breakages during cutover — the shadow-read + Shepherd-owner audit caught the long tail.",
				]}
				bridge="Tecton managed online store is DynamoDB or Redis. At GYG, worth auditing whether teams have built auxiliary caches on top (the 'per-team serving surface' smell) — that's the signal you need platform consolidation."
			/>

			<StarCard
				title="STAR 3 — PIT-correct training dataframes"
				situation="Without disciplined PIT semantics, training datasets silently leak information from the future. Early versions of `get_training_dataframe` joined feature tables on entity key alone — a classic train-serve skew trap."
				task="Make PIT correctness a property of the SDK, not of DS discipline."
				actions={[
					"Required event-timestamp + entity-key on every feature; joins were always 'as-of' joins driven by the label event.",
					"Wrote generator code that translated SDK calls into Trino SQL with windowed lookups — enforced in the SDK, DS couldn't bypass.",
					"Added `fs.materialize_at_run(run_id)` — reconstruct historical feature state from Lasso lineage for retraining.",
					"Instrumented PIT-correctness-assertion events; ran them on every training run as part of MLflow logging.",
				]}
				result={[
					"Train-serve skew regressions dropped to ~0 for models built via the SDK path.",
					"Reproducibility: a DS could retrain from a 6-month-old run ID by running one SDK call; lineage + PIT carried the state.",
					"Became the pattern referenced in new-platform design reviews.",
				]}
			/>

			<StarCard
				title="STAR 4 — Feature Governance + auto-deprecation"
				situation="Feature catalog sprawled as teams shipped features and then moved on. No one knew which features were still powering production models, which were demoed once and abandoned, which were duplicates."
				task="Build the signal that lets Governance safely auto-deprecate unused features."
				actions={[
					"Every `get_training_dataframe` + `get_features` call emitted a Lasso event — tenant, user, featureset + version, MLflow run ID, row count, schema hash.",
					"Feature Observability wrote quality/drift events on every materialization.",
					"Governance service ran a 180-day rolling query: featuresets with zero production-model dependencies + zero interactive reads → flagged for deprecation.",
					"Two-stage deprecation: banner on the UI + owner email → 30 days later hard-remove unless explicitly pinned.",
				]}
				result={[
					"Deprecated 47 unused featuresets in one cycle — ~12TB of storage, ~$4k/month of materialization compute.",
					"Regulator audit closed in 20 minutes using the same lineage: 'which models consumed PII attribute X in training?'",
				]}
			/>
		</Section>
	);
}

/* ============================================================
 * KAAS
 * ============================================================ */

function SectionKaasArchitecture() {
	return (
		<Section id="kaas-architecture" title="KaaS — architecture">
			<Frame>
				<p>
					Patented as US 2023/0229438 A1 (I'm on the team, not on the patent —
					inventors are Bursik, Jesser, Bloomquist, Solas, Ghosh). Extends
					Jupyter Enterprise Gateway with custom ProcessProxies per compute
					substrate, behind a chain of proxies that terminate at remote
					kernels.
				</p>
			</Frame>
			<Ascii>{`          Kubernetes                            TAP              Remote Kernels
                                                                 (Spark, Ray, GPUs)

┌─────┐ ┌───────┐ ┌──────────┐ ┌─────────────────┐    ┌────────────┐
│User │►│proxy  │►│ oauth2   │►│ Authorization   │──┐ │ Lasso APIs │
└─────┘ └───────┘ │ proxy¹   │ │ Proxy²          │  │ └────────────┘
                  └──────────┘ └─────────────────┘  │        ▲
                                        │           │        │
                                        ▼           │        │
                              ┌─────────────────┐   │  ┌───────────┐   ┌──────────┐
                              │ Jupyter Lab     │   │  │ Kernel    │──►│ auth     │──► Kernel
                              │  Proxy³         │───┼─►│ Gateway   │   │ proxy⁶   │    Gateway
                              │  Custom Kernel  │   │  │ Proxy⁵    │   │          │    1..n
                              │  Extensions⁴    │   │  └───────────┘   └──────────┘
                              └─────────────────┘   │`}</Ascii>
			<Frame>
				<p className="text-sm">
					<span className="text-volt-snow">Proxy chain (memorize).</span> User
					→ Nginx → oauth2 proxy (Target SSO) → Authorization Proxy (validates
					lab access + caches bearer token) → Jupyter Lab (local proxy + custom
					kernel extensions) → Kernel Gateway Proxy → per-substrate auth proxy
					→ Kernel Gateway → remote kernel (Spark / Ray / GPU).
				</p>
				<p className="text-sm">
					<span className="text-volt-snow">Service Orchestrator (patent FIG
					4).</span> Six components: Kernel Manager, Synchronizer, Service DB,
					Cache Manager, Kernel Image Updater, Data Metrics Service.
				</p>
				<p className="text-sm">
					<span className="text-volt-snow">Compute substrates.</span> Argus
					(BigRed3 YARN) · TAP (K8s) · GCP Vertex (Custom Kernel Extensions) ·
					Kernel Gateway for Ray + GPU pools. One ProcessProxy subclass per
					substrate.
				</p>
			</Frame>
		</Section>
	);
}

function SectionKaasOwnership() {
	return (
		<Section id="kaas-ownership" title="KaaS — what I owned">
			<Frame>
				<Bullets
					items={[
						"`X-Tgt-Access-Token` header + TokenRefresher class — the auth-propagation mechanism for long-lived kernels that outlived the 4-hour Target bearer token.",
						"ArgusProcessProxy productionization — from feature-branch prototype to 99.5% kernel-start SLA: retries, Kerberos renewal, multi-VLM routing, graceful shutdown.",
						"`run.sh` / `run_argus.py` YARN-side launch contract — env setup, Kerberos `kinit`, token injection, ipykernel bootstrap.",
						"Cell-granular Cache Manager implementation — hash `(cell_code, sorted(upstream_cache_keys), kernel_image_hash)`; intercept before kernel dispatch.",
						"Kernel Image Updater lifecycle + pinned-image registry after the 'silent users are real users' incident.",
					]}
				/>
				<p className="text-xs text-volt-steel pt-2">
					Not on the patent. The inventors are: Jeffrey Bursik, Matthew Jesser,
					Sam Bloomquist, Nathan Solas, Debashis Ghosh. Worked alongside them
					on productionization + developer experience.
				</p>
			</Frame>
		</Section>
	);
}

function SectionKaasStars() {
	return (
		<Section id="kaas-stars" title="KaaS — STAR stories">
			<StarCard
				title="STAR 1 — X-Tgt-Access-Token + TokenRefresher"
				situation="Kernels lived for hours to days for training sweeps. Target bearer tokens lived for ~4 hours. At expiry, every API call from the kernel returned 401 with no obvious reason — top-3 DS-reported issue on KaaS."
				task="Design auth propagation + token refresh for long-lived kernels. Constraints: act as the user (no shared service account); no hourly re-auth; every call audit-traceable; works across all substrates."
				actions={[
					"Designed `X-Tgt-Access-Token` header on every GatewayClient call — separate from the upstream `Authorization` header so we could rotate them independently.",
					"TokenRefresher class polled an internal-only endpoint (reachable only from the single Jupyter Lab pod) every N minutes; the oauth2 proxy was the only component that could set the cached token.",
					"Token never hit disk — env var + in-memory only. Scoped to the user's AD groups so exposure gave no privilege escalation.",
					"Admin-NUA fallback — if the user's session had expired (went home), the kernel could still run via a scoped platform service account, tagged in audit logs as 'platform on behalf of <user>'. AD-group membership rechecked per call.",
					"Rolled out per-substrate: YARN env-var injection, K8s secret mount, GCP custom kernel extension.",
				]}
				result={[
					"Long-running kernel auth failures: ~1/DS/week → <1/DS/month.",
					"100% of kernel-originated API calls traceable to a user or 'platform on behalf of'.",
					"Passed the Target AppSec cross-substrate auth threat-model review on the first attempt.",
					"TokenRefresher + internal-endpoint pattern lives in the white paper.",
				]}
				bridge="Databricks SCIM handles single-substrate auth. Seam is when a workload spans Databricks + Tecton + MLflow + S3 — does user identity carry through, or does it collapse to a service account somewhere?"
			/>

			<StarCard
				title="STAR 2 — ArgusProcessProxy productionization"
				situation="JEG shipped ProcessProxies for K8s, SSH, and raw YARN — none played well with Argus, Target's internal YARN-wrapping API (entitlements, VLM routing, observability). A prototype ArgusProcessProxy handled the happy path only."
				task="Productionize to 99.9% start success, p99 start < 60s, automatic recovery from YARN + Argus transient failures, DS population growing 200 → 400."
				actions={[
					"Proper inheritance from JEG's `ProcessProxy`: override `launch_process`, `poll`, `send_signal`, `kill` with Argus specifics.",
					"`run.sh` + `run_argus.py` YARN-side contract — PYTHONPATH, venv, `kinit` with delegated keytab, token injection, Argus registration, ipykernel bootstrap writing connection file.",
					"Heartbeat-based `poll()` via Argus status API with a local cache layer to avoid hammering Argus.",
					"Exponential backoff with jitter on launch + poll; categorized errors into transient vs permanent (no retry on 403).",
					"In-container Kerberos ticket renewal daemon (`kinit -R`) coordinated with X-Tgt-Access-Token refresh.",
					"Multi-VLM routing — per-tenant queue + resource pool, with sensible default when a user belonged to multiple VLMs.",
					"State-persistence layer so running kernels survived Argus API outages; reconciled on recovery.",
				]}
				result={[
					"Kernel-start success: 92% → 99.5% over 2 quarters.",
					"p99 kernel-start: ~120s → ~45s.",
					"Argus-related DS incidents: −80% Q/Q after rollout.",
					"First ML platform component to pass the SRE production-readiness review at the time.",
					"Became the reference implementation for other teams submitting long-running jobs through Argus.",
				]}
			/>

			<StarCard
				title="STAR 3 — Cell-granular Cache Manager"
				situation="Patent had a Cache Manager, but the prototype hashed the whole notebook — a single edit invalidated everything downstream. Universal DS complaint: 'I'm iterating on cell 12 but cells 1-11 re-run for 15-20 minutes every time.'"
				task="Ship the patent's vision — cell-level caching with dependency-aware invalidation."
				actions={[
					"Cache key per cell: `hash(cell_code + sorted(upstream_cell_cache_keys) + kernel_image_hash)`. Edit cell N invalidates N + downstream; upstream stays cached.",
					"Synchronizer intercepted execute requests — on cache hit, returned cached output without ever reaching the kernel.",
					"Per-user cache 5GB; global 500GB; LRU eviction; 7-day TTL.",
					"Data Metrics counters for hits/misses/evictions by user + notebook + cell on platform dashboards.",
					"`#!cache:skip` magic for force-refresh escape hatch.",
					"Updated DS onboarding docs with 'cell design for cache utility' guidance.",
				]}
				result={[
					"Cache hit rate stabilized at ~62% of cell executions in Q1 after rollout.",
					"p50 notebook re-run: ~8 min → ~1.5 min for typical mixed notebooks.",
					"DS NPS on KaaS: +15 → +38 in one quarter — largest single-quarter jump on record.",
					"Estimated 15% reduction in BigRed3 + TAP interactive compute cost, attributed via Lasso execution records.",
					"Contributed to the patent's continuation filing (acknowledged, not an inventor).",
				]}
			/>

			<StarCard
				title="STAR 4 — Kernel image governance + pinned-image recovery"
				situation="~40 kernel images grew over 2 years. 90/180/270-day re-vetting policy existed; the 270-day hard-decommission had never been enforced. I inherited it."
				task="Turn on the hard decommission. First batch: 8 images past 270 days. Zero platform incidents."
				actions={[
					"Usage audit via Data Metrics + Service DB — 6 of 8 used interactively by <10 DSes; safe after direct outreach.",
					"Other 2 were powering production-adjacent nightly notebooks owned by a reorg'd team — DSes weren't logging in, never saw deprecation banners. Traced owners via Shepherd job-owner mappings.",
					"Graduated warning cadence: 30/14/3-day email + Slack to image owners + job owners.",
					"Ran decommission. 7 of 8 clean. 1 unacknowledged broke 3 nightly jobs — owner had left the company.",
					"Rolled back in <1h; added the image back as 'deprecated-pinned'.",
					"Designed and shipped the pinned-image registry — expedited quarterly review, owner must attest image still needed.",
					"Re-ran the decommission 2 months later with pinned-image registry in place: clean.",
				]}
				result={[
					"Policy is now production-stable — ~15 additional images decommissioned cleanly since.",
					"~12 entries in the pinned registry at any time — the right escape hatch.",
					"Post-mortem 'silent users are real users' became the reference for future platform migrations (including the online-store migration above).",
					"Zero production jobs broken by kernel-image decommission since the pinned registry shipped.",
				]}
			/>
		</Section>
	);
}

/* ============================================================
 * MLFLOW
 * ============================================================ */

function SectionMLflowArchitecture() {
	return (
		<Section id="mlflow-architecture" title="MLflow — architecture">
			<Frame>
				<p>
					MLflow as the registry + tracking backbone. Postgres for metadata,
					TOSS (Target Object Storage) for artifacts. Wrapped with a plugin
					library for auth + conventions, Vela plugins for deployment, Kafka
					for promotion events, and a declarative `targetml.yml` DS contract.
				</p>
			</Frame>
			<Ascii>{`┌──────────────────────┐
│ User's Model         │   Code pushed to GitHub
│ Training Code        │────────────────────────────┐
│ (PyTorch, LightGBM)  │                            │
└─────────┬────────────┘                            ▼
          │                                  ┌──────────────┐
          │ mlflow + mlflow-target plugin    │ GitHub Ent.  │
          ▼                                  └──────┬───────┘
┌──────────────────────────┐                        │  triggers
│ MLflow Tracking Server   │                        ▼
│  + Model Registry        │                 ┌──────────────┐
│  + plugin (auth,         │                 │ Vela CI/CD   │
│    conventions, events)  │                 └──────┬───────┘
└─────┬────────┬───────────┘                        │
      │        │                                    │
      ▼        ▼                                    │
┌──────────┐ ┌──────────┐      alias/promo events   │
│ Postgres │ │ TOSS     │────► Kafka ───────────────┤
│ (runs,   │ │ (model   │                           │
│  metrics,│ │  artif., │                           ▼
│  params, │ │  configs)│                  Docker image build
│  registry│ │          │                  + Artifactory push
└──────────┘ └──────────┘                           │
                        ┌───────────────────────────┴──────────┐
                        ▼                                      ▼
              ┌──────────────┐                       ┌───────────────┐
              │ Online       │                       │ Offline       │
              │ SCA + TAP    │                       │ Shepherd +    │
              │ GCP          │                       │ Argus + SCA   │
              └──────────────┘                       └───────────────┘`}</Ascii>
			<Frame>
				<p className="text-sm">
					<span className="text-volt-snow">Interaction levels.</span> Level 1
					(fully managed — DS writes `targetml.yml` + `vela.yml` + model code;
					platform handles registration, deploy, monitoring). Level 2 (DS
					invokes platform plugins explicitly). Level 3 (DS uses registry
					directly, handles their own Vela deployments). `platform_mode:` field
					picks.
				</p>
			</Frame>
		</Section>
	);
}

function SectionMLflowOwnership() {
	return (
		<Section id="mlflow-ownership" title="MLflow — what I owned">
			<Frame>
				<Bullets
					items={[
						"`mlflow-target` plugin library — auth (SSO + AD-group mapping + TokenRefresher reuse), convention wrappers, model-card enforcement, approval chains.",
						"Vela deployment plugin — Kafka-event-driven, canary rollout, auto-rollback, per-substrate deploy sub-pipelines (SCA / TAP / Shepherd / Argus).",
						"Feature-store ↔ MLflow lineage — SDK auto-logs featureset ID + version into active MLflow runs + Lasso.",
						"`targetml.yml` schema design + user research across 15 DSes from pricing, recs, fulfillment, fraud.",
						"DS onboarding docs + starter templates + office hours for the first 10 teams.",
					]}
				/>
			</Frame>
		</Section>
	);
}

function SectionMLflowStars() {
	return (
		<Section id="mlflow-stars" title="MLflow — STAR stories">
			<StarCard
				title="STAR 1 — mlflow-target plugin + auth integration"
				situation="Vanilla MLflow didn't integrate with Target's identity stack. DSes were manually pasting bearer tokens into `MLFLOW_TRACKING_TOKEN`, refreshing every 4 hours, exposed in process listings, no user-to-run audit trail. MLflow UI didn't know about AD groups, so access control was all-or-nothing."
				task="Build an `mlflow-target` plugin providing transparent auth, automatic refresh, user-identity propagation, and convention wrappers."
				actions={[
					"Python plugin hooked MLflow's request-auth extension points; intercepted outbound REST and attached `Authorization: Bearer <target-token>`.",
					"Reused the KaaS TokenRefresher pattern — inside a KaaS kernel it called the Jupyter Lab internal endpoint; on a laptop it used OAuth2 device-flow with encrypted local cache; in Vela it used a scoped NUA.",
					"Server-side middleware validated tokens against Target IdP (with short-TTL cache), mapped AD groups to MLflow workspace access, logged every authenticated action to Lasso.",
					"Convention wrappers: `log_run(team=, model_family=, ...)`, `register_model_target(name, risk_tier, ...)` required model-card metadata, `promote_model_to_production(name, version, approvers=[])` enforced 1-approval-medium / 2-approval-high chains, `link_featureset(model, featureset_id)` wrote the lineage edge.",
					"Migration guide: `pip install mlflow-target` + change `import mlflow` to `import mlflow_target as mlflow`.",
				]}
				result={[
					"100% of MLflow calls auth'd via SSO within 6 weeks.",
					"First time we could answer 'who promoted model X to production?' without forensic search.",
					"Model-card enforcement at registration time became muscle memory after one quarter.",
					"Feature → model lineage graph unlocked Feature Governance deprecation analysis.",
				]}
			/>

			<StarCard
				title="STAR 2 — Vela plugin: event-driven deployment"
				situation="Before: DS logged model to MLflow → tagged as production-ready → opened PR on a separate deployment repo → reviewed → merged → watched Vela deploy. 1–3 days. DSes hated it. Deploy team was the bottleneck."
				task="Kafka-event-driven pipeline: MLflow alias change → auto deploy. Respect approval chains, full audit, automatic rollback, online (SCA/TAP) + offline (Shepherd/Argus)."
				actions={[
					"Plugin emits `mlflow.model.registry.events` to Kafka on promote; model name as partition key for ordering.",
					"Model Registry Deployment Producer transforms → `mlflow.model.deployment.triggers`.",
					"Stateless Vela plugin: fetch artifact from TOSS, pull `targetml.yml` from repo, generate Docker (framework-specific serving entrypoint), push to Artifactory with the model version as tag.",
					"Substrate-specific sub-pipelines: SCA (K8s Deployment + Istio VirtualService for canary), TAP (TAP app + internal LB), Shepherd (scheduled job + retry + alert), Argus (YARN spec + queue).",
					"Canary: 5% → 25% → 50% → 100% with 15-min dwell, guardrails on error rate + latency + drift, auto-rollback on any trip.",
					"Rollback re-aliases the MLflow model to the previous production version + emits `deployment.failed` with context + Slacks the owning team.",
				]}
				result={[
					"Time-to-production: 1–3 days → ~15 min for typical online deploys; 2–4h for large SCA deploys.",
					"DS involvement: 'DS owns PR, deploy team owns rollout' → 'DS pushes code + yml; platform handles everything'.",
					"Deployment incidents: ~1/week → <1/month. Canary + auto-rollback caught the rest before real traffic.",
					"DS deployment NPS: +2 → +42 over two quarters.",
				]}
			/>

			<StarCard
				title="STAR 3 — Feature-store ↔ MLflow lineage"
				situation="MLflow runs knew nothing about which features they consumed. Reproducibility broken. Feature Governance deprecation required cross-repo grep + institutional memory."
				task="Automatic feature→model lineage. No DS code changes. Captures featureset ID + version + row count + schema hash. Queryable via MLflow UI + Lasso graph."
				actions={[
					"Instrumented `fs.get_training_dataframe()` to detect active MLflow run context and write a run tag: `fs.featureset.{id}.version = {version}` + schema hash + row count.",
					"Rich structured event to Lasso: tenant, user, featureset + version, MLflow run ID, row count, schema hash, cost estimate.",
					"Feature Mgmt UI: 'Models using this feature' panel driven by Lasso graph. MLflow UI: 'Features consumed by this model' panel via mlflow-target UI extension.",
					"`fs.materialize_at_run(run_id)` — PIT-correct training dataframe reconstruction from lineage for historical retrains.",
					"Retroactive backfill via Lasso execution logs — covered ~85% of pre-existing runs.",
					"Edge cases: multiple featuresets per run (multiple tags); non-FS sources via `fs.log_external_source()`; notebook-only reads emit to Lasso only.",
				]}
				result={[
					"100% of MLflow runs after rollout have feature lineage.",
					"Feature Governance deprecation analysis: week-long investigation → 5-minute query.",
					"Auto-deprecated 47 unused featuresets (no model deps >180d) → ~12TB storage, ~$4k/month compute.",
					"Regulator audit: 'which models consumed PII attribute X in training?' — closed in 20 min.",
				]}
			/>

			<StarCard
				title="STAR 4 — targetml.yml + DS onboarding"
				situation="Platform strategy called for a DS-facing YAML contract. Competing proposals: minimal YAML (pushes too much into Vela templates), rich YAML (risks bloat), Python-based Metaflow-style (powerful but a bigger jump)."
				task="Design the schema, build the Vela plugin, onboard the first 10 DS teams. Must support Level 1/2/3."
				actions={[
					"User research across 15 DSes: pricing, recs, fulfillment, fraud. Learned: defaults with overrides > full declaration.",
					"Layered schema — `model:` minimum, `training:`, `deployment:` with `canary:` + `autoscale:`, `monitoring:` with drift thresholds, `platform_mode:` escape hatch.",
					"Vela plugin validated schema at PR time (CI check), cross-referenced featureset IDs against Feature Store + MLflow entries against registry (blocks PR if stale), generated deployment behavior + approval gates, emitted Lasso events per platform decision.",
					"Published `target-ml-platform-quickstart` repo with per-framework examples. Office hours 3×/week for 2 months.",
					"Paired with senior DS on each team's first onboarding; schema v1.1 landed in month 3 with `compute.substrate` overrides, dev-mode featuresets, `platform_mode: partial`.",
				]}
				result={[
					"10 teams onboarded in 2 quarters; ~40 models under targetml.yml by end of year 1.",
					"Time-to-first-deployment for new team: ~6 weeks → ~9 days.",
					"Experienced-team new-model onboarding: ~5 days → ~4 hours.",
					"Platform NPS: −3 → +28 — largest single-quarter improvement on record.",
					"Layered-schema pattern was cited as reference by the data-pipeline team.",
				]}
			/>
		</Section>
	);
}

/* ============================================================
 * SUBSTRATE / INDUSTRY / SCRIPTS
 * ============================================================ */

function SectionSeams() {
	return (
		<Section id="seams" title="How they connect">
			<Frame>
				<p>
					These aren't three platforms — three surfaces of one. The shared
					substrate (Lasso, Shepherd, unified auth) is what made it coherent.
					The seams are where integration work lives.
				</p>
				<Bullets
					items={[
						"Feature Store ↔ MLflow — SDK emits lineage to runs, mlflow-target reads FS metadata, Feature Governance queries Lasso for feature→model deps.",
						"KaaS ↔ MLflow — KaaS kernels use the same `X-Tgt-Access-Token` pattern; MLflow 'just works' from any kernel without separate creds.",
						"KaaS ↔ Feature Store — kernel env var authenticates FS SDK calls via ArgusProcessProxy injection; 'load features into my notebook' is a one-liner.",
						"Everything ↔ Lasso — one event schema covered kernel launches, feature materializations, MLflow runs, deployments, drift events. One lineage graph, not three.",
						"Everything ↔ Shepherd — orchestration contract for all workloads: create-featureset pipelines, kernel launches, model deployments.",
					]}
				/>
			</Frame>
		</Section>
	);
}

function SectionIndustry() {
	return (
		<Section id="industry" title="Industry comparisons">
			<Frame>
				<h3 className="comic-heading text-base text-volt-snow">
					Feature Store analogs
				</h3>
				<Bullets
					items={[
						"**Tecton (GYG's stack)** — `FeatureView` / `StreamFeatureView` ≈ our `create_featureset`; managed control plane ≈ Data Placement API.",
						"**BharatMLStack (Meesho)** — Kafka-buffered writes, binary feature groups, ScyllaDB + Dragonfly for sub-10ms gRPC serving. One binary format everywhere. We were more opinionated about Data Placement per-feature.",
						"**Airbnb Bighead / Zipline** — the gold standard: one definition, two materializations, PIT-correct offline joins as API primitives.",
					]}
				/>
			</Frame>
			<Frame>
				<h3 className="comic-heading text-base text-volt-snow">
					Notebook platform analogs
				</h3>
				<Bullets
					items={[
						"**JupyterHub / BinderHub** — per-user servers, single substrate, no token propagation or caching. We added the entire Service Orchestrator on top.",
						"**Databricks Notebooks (GYG)** — clusters, Repos, Delta Live Tables, Unity Catalog. The polymorphic-compute problem is solved within Databricks; seam is workloads that span Databricks + Ray + external GPU pools.",
						"**Netflix Metaflow** — bets on 'promote notebook to typed Python workflow' rather than 'make the notebook production-capable'. Our ~400 DSes with deep notebook muscle-memory would have hated that rewrite.",
						"**Airbnb Bighead** — tight notebook + feature-store + registry lineage closure. We had the primitives but not as prescriptively enforced at the notebook surface.",
					]}
				/>
			</Frame>
			<Frame>
				<h3 className="comic-heading text-base text-volt-snow">
					Model registry + deploy analogs
				</h3>
				<Bullets
					items={[
						"**Databricks Unity Catalog Models** — where the industry is heading: model lineage to data + features + fine-grained access + audit + serving integration. If GYG uses it, that's the current state.",
						"**Uber Michelangelo** — end-to-end, never open-sourced; we had the equivalent integrated shape on top of MLflow.",
						"**Netflix Metaflow** — typed-Python pipelines as the unit; we kept the DS-facing contract declarative (`targetml.yml`) so it stayed framework-agnostic.",
					]}
				/>
			</Frame>
		</Section>
	);
}

function SectionMemorize() {
	return (
		<Section id="memorize" title="Memorized one-liners">
			<Frame>
				<h3 className="comic-heading text-base text-volt-snow">
					30-sec intro
				</h3>
				<p className="text-sm">
					"~10 years progressively deeper in ML platform work. 5 at Amazon in
					analytics, then Quantiphi as an ML engineer, then 4 at Target as
					Senior and then Lead ML Engineer — feature store, KaaS notebooks,
					MLflow, model serving. Now leading Applied AI at Deriv, team of 8,
					production AI for the partner ecosystem."
				</p>
			</Frame>
			<Frame>
				<h3 className="comic-heading text-base text-volt-snow">
					Feature Store (one breath)
				</h3>
				<p className="text-sm">
					"In-house Feature Store inside the TargetML Platform. Three tiers:
					SDK + UI, Data Placement + Feature Mgmt + Governance + Observability
					APIs, and a storage tier split offline (Iceberg over BR3/TOSS via
					Trino) + online (Cassandra/Redis/Kafka per the Data Placement API's
					decision). I owned the SDK onboarding flow, the online-serving
					migration, and the MLflow lineage coupling."
				</p>
			</Frame>
			<Frame>
				<h3 className="comic-heading text-base text-volt-snow">
					KaaS (one breath)
				</h3>
				<p className="text-sm">
					"KaaS — Target's Kernels-as-a-Service, patented as US 2023/0229438 A1
					(I'm on the team, not the patent). Extends JEG with custom
					ProcessProxies per substrate — ArgusProcessProxy for BigRed3 YARN,
					K8sProcessProxy for TAP, GCP Custom Kernel Extensions for Vertex,
					Kernel Gateway routing for Ray + GPU. Chain of proxies: user →
					Nginx → oauth2 → Authorization Proxy → Jupyter Lab (local proxy +
					custom extensions) → Kernel Gateway Proxy → auth proxies → remote
					kernels. Auth via `X-Tgt-Access-Token`, refreshed every N min from an
					internal endpoint only the Jupyter Lab pod can reach. I owned the
					ArgusProcessProxy hardening, the token-refresh mechanism, the
					cell-level cache, and the image-governance lifecycle."
				</p>
			</Frame>
			<Frame>
				<h3 className="comic-heading text-base text-volt-snow">
					MLflow (one breath)
				</h3>
				<p className="text-sm">
					"MLflow as the tracking + registry backbone (Postgres + TOSS). On top
					we built the mlflow-target plugin (auth, conventions, model-card +
					approval enforcement), Vela plugins (Kafka-event-driven deployment,
					canary + auto-rollback across SCA/TAP/Shepherd/Argus), the
					feature-store SDK coupling for lineage, and `targetml.yml` — the
					layered DS contract supporting fully-managed / platform-supported /
					DS-owned interaction modes. I owned slices of all four, with lineage
					integration and `targetml.yml` schema design being the primary
					contributions."
				</p>
			</Frame>
			<Frame>
				<h3 className="comic-heading text-base text-volt-snow">
					The senior framing
				</h3>
				<p className="text-sm">
					"These aren't three separate platforms — three surfaces of one
					integrated platform. The shared substrate (Lasso for events,
					Shepherd for orchestration, the auth model) is what makes them
					coherent. The places they'd diverge if you weren't careful are the
					seams we designed for explicitly."
				</p>
			</Frame>
		</Section>
	);
}
