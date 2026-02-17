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
			<pre className="font-mono text-xs text-comic-gray-medium mb-2">
				~/$ cat about.md
			</pre>
			<h1 className="comic-heading text-3xl text-comic-black mb-6">
				ABOUT
			</h1>
			<div className="space-y-6 text-comic-black">
				<p className="font-mono text-lg text-comic-gray-dark">
					Building AI products until they learn to build themselves.
				</p>
				<p className="text-comic-gray-medium leading-relaxed">
					Engineering Lead — Applied AI at Deriv (Dubai). 9+ years. 3× AWS
					certified. Educator. Professional introvert who thrives on writing to
					learn and loves questioning existing processes. Into RAG, MLOps, and
					making C-level dashboards that actually make sense.
				</p>
				<section className="border-[3px] border-comic-black p-5 bg-comic-gray">
					<h2 className="comic-heading text-sm mb-2 text-comic-black">
						$ git log --oneline
					</h2>
					<ul className="space-y-1 text-sm text-comic-gray-medium font-mono">
						<li>Deriv — Engineering Lead, Applied AI (current)</li>
						<li>Target — Lead Engineer, GenAI / Senior SWE</li>
						<li>Quantiphi — ML Engineer</li>
						<li>Amazon — Business Analyst</li>
						<li>UChicago Graham School — PGP Data Science & ML</li>
					</ul>
				</section>
				<section className="border-[3px] border-comic-black p-5 bg-comic-gray">
					<h2 className="comic-heading text-sm mb-2 text-comic-black">
						$ ls certs/
					</h2>
					<p className="text-sm text-comic-gray-medium">
						3× AWS (Solutions Architect, ML Specialty, Data Analytics), UChicago
						PGP Data Science & Machine Learning.
					</p>
				</section>
				<section className="border-[3px] border-comic-black p-5 bg-comic-gray">
					<h2 className="comic-heading text-sm mb-2 text-comic-black">
						$ echo $TECH
					</h2>
					<div className="flex flex-wrap gap-2">
						{TECH.map((t) => (
							<span
								key={t}
								className="font-mono text-xs px-2 py-1 border-2 border-comic-black bg-comic-yellow text-comic-black font-medium"
							>
								{t}
							</span>
						))}
					</div>
				</section>
				<p className="font-mono text-sm text-comic-gray-dark pt-4">
					Want to talk embeddings?{" "}
					<a href="#subscribe" className="font-display font-bold text-comic-black hover:text-comic-yellow transition underline">
						Drop a line
					</a>
					.
				</p>
			</div>
		</div>
	);
}
