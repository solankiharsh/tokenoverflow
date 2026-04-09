import type { Route } from "./+types/about";
import { extracurriculars } from "../data/extracurriculars";

/** Returns embed URL for YouTube or Vimeo, or null if unsupported. */
function getVideoEmbedUrl(url: string): string | null {
	try {
		const u = new URL(url);
		// YouTube: watch?v=ID or youtu.be/ID
		if (u.hostname === "www.youtube.com" && u.searchParams.get("v")) {
			return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
		}
		if (u.hostname === "youtu.be" && u.pathname.slice(1)) {
			return `https://www.youtube.com/embed/${u.pathname.slice(1).split("?")[0]}`;
		}
		// Vimeo: vimeo.com/ID
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
					Engineering Lead — Applied AI at Deriv (Dubai). 9+ years. 3× AWS
					certified. Educator. Professional introvert who thrives on writing to
					learn and loves questioning existing processes. Into RAG, MLOps, and
					making C-level dashboards that actually make sense.
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
						<li>Target — Lead Engineer, GenAI / Senior SWE</li>
						<li>Quantiphi — ML Engineer</li>
						<li>Amazon — Business Analyst</li>
						<li>UChicago Graham School — PGP Data Science & ML</li>
					</ul>
				</section>
				<section className="border border-volt-border p-5 bg-volt-carbon">
					<h2 className="comic-heading text-sm mb-2 text-volt-snow">
						$ ls certs/
					</h2>
					<p className="text-sm text-volt-steel">
						3× AWS (Solutions Architect, ML Specialty, Data Analytics), UChicago
						PGP Data Science & Machine Learning.
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
											rel="noreferrer"
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
