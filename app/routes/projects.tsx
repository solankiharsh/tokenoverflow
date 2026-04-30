import type { Route } from "./+types/projects";
import { projects } from "../data/projects";
import { ProjectCard } from "../components/ProjectCard";
import { buildMeta } from "../lib/seo";

export function meta({ location }: Route.MetaArgs) {
	return buildMeta({
		title: "Projects — applied AI, NLP, and platform work",
		description:
			"Selected side projects by Harsh Solanki: AI agents, NLP tooling, FastAPI services, ML pipelines, and the infrastructure powering this site.",
		path: location.pathname,
		keywords: [
			"Harsh Solanki projects",
			"AI side projects",
			"NLP projects",
			"FastAPI",
			"machine learning projects",
		],
	});
}

export default function Projects() {
	return (
		<div className="max-w-4xl mx-auto px-4 py-12">
			<pre className="font-mono text-xs text-volt-steel mb-2">
				~/$ ls projects/
			</pre>
			<h1 className="comic-heading text-3xl sm:text-4xl text-volt-snow mb-2">
				PROJECTS
			</h1>
			<p className="text-volt-steel mb-8">
				Stuff I built when not shipping AI at work.
			</p>
			<div className="grid gap-6 sm:grid-cols-2">
				{projects.map((project) => (
					<ProjectCard key={project.title} project={project} />
				))}
			</div>
		</div>
	);
}
