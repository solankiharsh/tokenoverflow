import type { Route } from "./+types/projects";
import { projects } from "../data/projects";
import { ProjectCard } from "../components/ProjectCard";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Projects | Harsh Solanki" },
		{
			name: "description",
			content: "Side projects and things built: NLP, ML tooling, FastAPI, this site.",
		},
	];
}

export default function Projects() {
	return (
		<div className="max-w-4xl mx-auto px-4 py-12">
			<pre className="font-mono text-xs text-comic-gray-medium mb-2">
				~/$ ls projects/
			</pre>
			<h1 className="comic-heading text-3xl sm:text-4xl text-comic-black mb-2">
				PROJECTS
			</h1>
			<p className="text-comic-gray-medium mb-8">
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
