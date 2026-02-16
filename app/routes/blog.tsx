import { Link } from "react-router";
import type { Route } from "./+types/blog";
import { loadContextKey } from "../lib/load-context";
import { getPosts } from "../data/blog";

export async function loader(args: Route.LoaderArgs) {
	const env = args.context.get(loadContextKey).cloudflare.env as { DB?: Parameters<typeof getPosts>[0] };
	if (!env?.DB) {
		console.warn("[blog] D1 DB binding not available (e.g. local dev without migrations). Returning empty posts.");
		return { posts: [] };
	}
	try {
		const posts = await getPosts(env.DB);
		return { posts };
	} catch (err) {
		console.warn("[blog] D1 query failed (run local migrations: make db-migrate-local).", err);
		return { posts: [] };
	}
}

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Blog | Harsh Solanki" },
		{
			name: "description",
			content: "AI/ML nuggets, RAG, and writing to learn.",
		},
	];
}

export default function Blog({ loaderData }: Route.ComponentProps) {
	const { posts } = loaderData;
	return (
		<div className="max-w-3xl mx-auto px-4 py-12">
			<h1 className="font-mono text-2xl text-[var(--terminal-accent)] mb-2">
				~/$ ls blog/
			</h1>
			<p className="text-sm text-[var(--terminal-text-muted)] mb-8">
				Occasional posts. Mostly for my future self.
			</p>
			<ul className="space-y-6">
				{posts.map((post) => (
					<li key={post.slug}>
						<article className="rounded border border-[var(--terminal-border)] p-4 hover:border-[var(--terminal-accent)] transition-colors">
							<Link to={`/blog/${post.slug}`} className="block group">
								<h2 className="font-mono text-[var(--terminal-accent)] group-hover:underline mb-1">
									{post.title}
								</h2>
								<p className="text-xs text-[var(--terminal-text-muted)] mb-2">
									{post.date}
								</p>
								<p className="text-sm text-[var(--terminal-text-muted)]">
									{post.excerpt}
								</p>
								<span className="font-mono text-sm text-[var(--terminal-accent)] mt-2 inline-block group-hover:underline">
									Read more →
								</span>
							</Link>
						</article>
					</li>
				))}
			</ul>
		</div>
	);
}
