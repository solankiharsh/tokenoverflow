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
			<pre className="font-mono text-xs text-[var(--terminal-text-muted)] mb-4">
				{`harsh@tokenoverflow ~ $ whoami`}
			</pre>
			<h1 className="font-mono text-3xl sm:text-4xl text-[var(--terminal-text)] mb-4">
				Harsh Solanki
			</h1>
			<p className="font-mono text-lg text-[var(--terminal-green)] mb-6">
				Building AI products until they learn to build themselves.
			</p>
			<p className="text-[var(--terminal-text-muted)] mb-8 max-w-xl">
				Engineering Lead — Applied AI at Deriv. 9+ years. 3× AWS certified.
				Educator. Professional introvert who writes to learn.
			</p>
			<nav className="flex flex-wrap gap-4 font-mono text-sm">
				<Link
					to="/about"
					className="text-[var(--terminal-accent)] hover:underline"
				>
					~/$ about
				</Link>
				<Link
					to="/projects"
					className="text-[var(--terminal-accent)] hover:underline"
				>
					~/$ projects
				</Link>
				<Link
					to="/blog"
					className="text-[var(--terminal-accent)] hover:underline"
				>
					~/$ blog
				</Link>
				<a
					href="#subscribe"
					className="text-[var(--terminal-accent)] hover:underline"
				>
					~/$ subscribe
				</a>
			</nav>
		</div>
	);
}
