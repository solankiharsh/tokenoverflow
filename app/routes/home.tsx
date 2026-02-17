import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Harsh Solanki | Engineering Lead, Applied AI" },
		{
			name: "description",
			content:
				"Building AI products until they learn to build themselves. Dubai. 3× AWS. Educator.",
		},
	];
}

export default function Home() {
	return (
		<div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
			{/* Nerdy terminal line */}
			<pre className="font-mono text-xs text-comic-gray-medium mb-4">
				{`harsh@tokenoverflow ~ $ whoami`}
			</pre>
			<h1 className="comic-heading text-4xl sm:text-5xl text-comic-black mb-4 leading-tight">
				HARSH <span className="yellow-highlight">SOLANKI</span>
			</h1>
			<p className="font-mono text-lg text-comic-gray-dark mb-4">
				Building AI products until they learn to build themselves.
			</p>
			<p className="text-comic-gray-medium mb-4 max-w-xl">
				Engineering Lead — Applied AI at Deriv. 9+ years. 3× AWS certified.
				Educator. Professional introvert who writes to learn.
			</p>
			<p className="text-comic-gray-dark text-sm mb-8 space-x-4">
				<Link to="/about#ai-impact" className="font-mono hover:text-comic-yellow transition underline">
					→ AI leadership & impact at Deriv
				</Link>
				<Link to="/about#extracurriculars" className="font-mono hover:text-comic-yellow transition underline">
					→ Speaking & videos
				</Link>
			</p>
			<nav className="flex flex-wrap gap-3">
				<Link
					to="/about"
					className="comic-btn-outline text-sm py-2 px-4 no-underline"
				>
					ABOUT
				</Link>
				<Link
					to="/projects"
					className="comic-btn-outline text-sm py-2 px-4 no-underline"
				>
					PROJECTS
				</Link>
				<Link
					to="/blog"
					className="comic-btn-outline text-sm py-2 px-4 no-underline"
				>
					BLOG
				</Link>
				<Link
					to="/cloak"
					className="comic-btn text-sm py-2 px-4 no-underline"
				>
					CLOAK
				</Link>
				<a
					href="#subscribe"
					className="comic-btn-outline text-sm py-2 px-4 no-underline"
				>
					SUBSCRIBE
				</a>
			</nav>
		</div>
	);
}
