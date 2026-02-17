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
				<section className="border-[3px] border-comic-black p-5 bg-comic-gray" id="ai-impact">
					<figure className="m-0">
						<img
							src="/harsh-solanki-ai-leadership-infographic.png"
							alt="Harsh Solanki: Driving AI Innovation & Leadership at Deriv — Strategic AI Product Leadership (6+ revenue-generating products including Nexus, Site Sense, SponsorFlow; 7-person engineering team; high-velocity workflows, compliance, product leads) and Community Engagement & AI Advocacy (300+ AI Talent Sprint participants, Everyday AI global workshops in Dubai and Jordan, global hackathon mentorship with lablab.ai)"
							className="w-full h-auto rounded border-2 border-comic-black"
							loading="lazy"
							width={1200}
							height={675}
						/>
						<figcaption className="comic-heading text-xs mt-2 text-comic-gray-medium text-center">
							AI leadership & impact at Deriv — product, team, and community.
						</figcaption>
					</figure>
				</section>
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
				<section className="border-[3px] border-comic-black p-5 bg-comic-gray" id="extracurriculars">
					<h2 className="comic-heading text-sm mb-4 text-comic-black">
						$ cat extracurriculars.md
					</h2>
					<p className="text-xs text-comic-gray-medium mb-4">
						Speaking, workshops, and beyond.
					</p>
					<ul className="space-y-8">
						{extracurriculars.map((item, i) => (
							<li key={i} className="space-y-3">
								<div className="font-mono text-sm font-medium text-comic-black">
									{item.href ? (
										<a
											href={item.href}
											target="_blank"
											rel="noreferrer"
											className="hover:text-comic-yellow transition underline"
										>
											{item.title}
										</a>
									) : (
										item.title
									)}
								</div>
								{item.date && (
									<p className="text-xs text-comic-gray-dark font-mono">{item.date}</p>
								)}
								{item.image && (
									<figure className="m-0">
										<img
											src={item.image}
											alt={item.title}
											className="w-full max-w-md h-auto rounded border-2 border-comic-black"
											loading="lazy"
										/>
									</figure>
								)}
								{item.videoUrl && getVideoEmbedUrl(item.videoUrl) && (
									<div className="aspect-video w-full max-w-lg rounded border-2 border-comic-black overflow-hidden bg-comic-black">
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
									<p className="text-sm text-comic-gray-medium leading-relaxed">
										{item.description}
									</p>
								)}
							</li>
						))}
					</ul>
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
