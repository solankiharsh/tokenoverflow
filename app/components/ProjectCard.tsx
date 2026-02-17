import { Link } from "react-router";
import type { Project } from "../data/projects";

interface ProjectCardProps {
	project: Project;
}

const isInternal = (href: string) => href.startsWith("/");

export function ProjectCard({ project }: ProjectCardProps) {
	return (
		<article className="comic-card-hover p-5 flex flex-col">
			<h3 className="comic-heading text-xl text-comic-black mb-1">
				{project.title}
			</h3>
			<p className="text-sm text-comic-gray-medium mb-3">
				{project.description}
			</p>
			<div className="flex flex-wrap gap-2 mb-4">
				{project.tech.map((t) => (
					<span
						key={t}
						className="font-mono text-xs px-2 py-1 border-2 border-comic-black bg-comic-gray text-comic-gray-dark font-medium"
					>
						{t}
					</span>
				))}
			</div>
			{project.href &&
				(isInternal(project.href) ? (
					<Link
						to={project.href}
						className="comic-btn-outline text-sm py-2 px-4 inline-flex items-center justify-center gap-1 no-underline mt-auto w-fit"
					>
						VIEW →
					</Link>
				) : (
					<a
						href={project.href}
						target="_blank"
						rel="noreferrer"
						className="comic-btn-outline text-sm py-2 px-4 inline-flex items-center justify-center gap-1 no-underline mt-auto w-fit"
					>
						VIEW →
					</a>
				))}
		</article>
	);
}
