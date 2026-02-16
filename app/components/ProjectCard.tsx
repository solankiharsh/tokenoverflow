import type { Project } from "../data/projects";

interface ProjectCardProps {
	project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
	return (
		<article className="rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] p-4 hover:border-[var(--terminal-accent)] transition-colors">
			<h3 className="font-mono text-[var(--terminal-accent)] font-medium mb-1">
				{project.title}
			</h3>
			<p className="text-sm text-[var(--terminal-text-muted)] mb-3">
				{project.description}
			</p>
			<div className="flex flex-wrap gap-2 mb-2">
				{project.tech.map((t) => (
					<span
						key={t}
						className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--terminal-border)] text-[var(--terminal-text-muted)]"
					>
						{t}
					</span>
				))}
			</div>
			{project.href && (
				<a
					href={project.href}
					target="_blank"
					rel="noreferrer"
					className="font-mono text-sm text-[var(--terminal-accent)] hover:underline inline-flex items-center gap-1"
				>
					View →
				</a>
			)}
		</article>
	);
}
