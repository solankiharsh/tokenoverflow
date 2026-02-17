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
			<pre className="font-mono text-xs text-comic-gray-medium mb-2">
				~/$ ls blog/
			</pre>
			<h1 className="comic-heading text-3xl text-comic-black mb-2">BLOG</h1>
			<p className="text-sm text-comic-gray-medium mb-8">
				Occasional posts. Mostly for my future self.
			</p>
			<ul className="space-y-6">
				{posts.map((post) => (
					<li key={post.slug}>
						<article className="comic-card-hover p-5">
							<Link to={`/blog/${post.slug}`} className="block group">
								<h2 className="comic-heading text-xl text-comic-black group-hover:text-comic-yellow transition mb-1">
									{post.title}
								</h2>
								<p className="text-xs text-comic-gray-medium mb-2 font-mono">
									{post.date}
								</p>
								<p className="text-sm text-comic-gray-medium">
									{post.excerpt}
								</p>
								<span className="font-display font-bold text-sm text-comic-black group-hover:text-comic-yellow transition mt-2 inline-block">
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
