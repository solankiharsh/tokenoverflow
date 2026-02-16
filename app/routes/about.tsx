import type { Route } from "./+types/about";

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
];

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "About | Harsh Solanki" },
		{
			name: "description",
			content:
				"Engineering Lead, Applied AI. Building AI products until they learn to build themselves.",
		},
	];
}

export default function About() {
	return (
		<div className="max-w-3xl mx-auto px-4 py-12">
			<h1 className="font-mono text-2xl text-[var(--terminal-accent)] mb-6">
				~/$ cat about.md
			</h1>
			<div className="space-y-6 text-[var(--terminal-text)]">
				<p className="font-mono text-lg text-[var(--terminal-green)]">
					Building AI products until they learn to build themselves.
				</p>
				<p className="text-[var(--terminal-text-muted)] leading-relaxed">
					Engineering Lead — Applied AI at Deriv (Dubai). 9+ years. 3× AWS
					certified. Educator. Professional introvert who thrives on writing to
					learn and loves questioning existing processes. Into RAG, MLOps, and
					making C-level dashboards that actually make sense.
				</p>
				<section>
					<h2 className="font-mono text-sm text-[var(--terminal-accent)] mb-2">
						$ git log --oneline
					</h2>
					<ul className="space-y-1 text-sm text-[var(--terminal-text-muted)] font-mono">
						<li>Deriv — Engineering Lead, Applied AI (current)</li>
						<li>Target — Lead Engineer, GenAI / Senior SWE</li>
						<li>Quantiphi — ML Engineer</li>
						<li>Amazon — Business Analyst</li>
						<li>UChicago Graham School — PGP Data Science & ML</li>
					</ul>
				</section>
				<section>
					<h2 className="font-mono text-sm text-[var(--terminal-accent)] mb-2">
						$ ls certs/
					</h2>
					<p className="text-sm text-[var(--terminal-text-muted)]">
						3× AWS (Solutions Architect, ML Specialty, Data Analytics), UChicago
						PGP Data Science & Machine Learning.
					</p>
				</section>
				<section>
					<h2 className="font-mono text-sm text-[var(--terminal-accent)] mb-2">
						$ echo $TECH
					</h2>
					<div className="flex flex-wrap gap-2">
						{TECH.map((t) => (
							<span
								key={t}
								className="font-mono text-xs px-2 py-1 rounded border border-[var(--terminal-border)] text-[var(--terminal-text-muted)]"
							>
								{t}
							</span>
						))}
					</div>
				</section>
				<p className="font-mono text-sm text-[var(--terminal-accent)] pt-4">
					Want to talk embeddings?{" "}
					<a href="#subscribe" className="hover:underline">
						Drop a line
					</a>
					.
				</p>
			</div>
		</div>
	);
}
