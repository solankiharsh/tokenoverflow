import { Link, useRouteError } from "react-router";
import ReactMarkdown from "react-markdown";
import type { Route } from "./+types/blog.$slug";
import { loadContextKey } from "../lib/load-context";
import { getPost } from "../data/blog";

export async function loader(args: Route.LoaderArgs) {
	const env = args.context.get(loadContextKey).cloudflare.env as { DB?: Parameters<typeof getPost>[0] };
	if (!env?.DB) {
		throw new Response("Not found", { status: 404 });
	}
	try {
		const post = await getPost(env.DB, args.params.slug);
		if (!post) throw new Response("Not found", { status: 404 });
		return { post };
	} catch {
		throw new Response("Not found", { status: 404 });
	}
}

export function meta({ loaderData }: Route.MetaArgs) {
	if (!loaderData) return [{ title: "Post | Harsh Solanki" }];
	return [
		{ title: `${loaderData.post.title} | Harsh Solanki` },
		{
			name: "description",
			content: loaderData.post.excerpt,
		},
	];
}

export default function BlogSlug({ loaderData }: Route.ComponentProps) {
	const { post } = loaderData;
	return (
		<div className="max-w-3xl mx-auto px-4 py-12">
			<Link
				to="/blog"
				className="font-mono text-sm text-[var(--terminal-text-muted)] hover:text-[var(--terminal-accent)] hover:underline mb-6 inline-block"
			>
				← blog
			</Link>
			<article>
				<h1 className="font-mono text-2xl text-[var(--terminal-accent)] mb-2">
					{post.title}
				</h1>
				<p className="text-sm text-[var(--terminal-text-muted)] mb-6">
					{post.date}
				</p>
				<div className="prose prose-invert prose-sm max-w-none [&_a]:text-[var(--terminal-accent)] [&_pre]:bg-[var(--terminal-border)] [&_pre]:p-3 [&_pre]:rounded [&_code]:font-mono [&_code]:text-sm">
					<ReactMarkdown>{post.content}</ReactMarkdown>
				</div>
			</article>
		</div>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();
	if (error && typeof error === "object" && "status" in error && error.status === 404) {
		return (
			<div className="max-w-3xl mx-auto px-4 py-12 text-center">
				<h1 className="font-mono text-2xl text-[var(--terminal-accent)] mb-4">
					404 — post not found
				</h1>
				<Link
					to="/blog"
					className="font-mono text-sm text-[var(--terminal-accent)] hover:underline"
				>
					← back to blog
				</Link>
			</div>
		);
	}
	throw error;
}
