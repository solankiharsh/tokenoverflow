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
			<h1 className="font-mono text-2xl text-[var(--terminal-accent)] mb-2">
				~/$ ls projects/
			</h1>
			<p className="text-sm text-[var(--terminal-text-muted)] mb-8">
				Stuff I built when not shipping AI at work.
			</p>
			<div className="grid gap-4 sm:grid-cols-2">
				{projects.map((project) => (
					<ProjectCard key={project.title} project={project} />
				))}
			</div>
		</div>
	);
}
