import { Link } from "react-router";
import type { Route } from "./+types/blog";
import { loadContextKey } from "../lib/load-context";
import { getPosts } from "../data/blog";
import { externalPosts } from "../data/external-posts";
import { buildMeta } from "../lib/seo";

export async function loader(args: Route.LoaderArgs) {
	const env = args.context.get(loadContextKey).cloudflare.env as { DB?: Parameters<typeof getPosts>[0] };
	if (!env?.DB) {
		console.warn("[blog] D1 DB binding not available (e.g. local dev without migrations). Returning empty posts.");
		return { posts: [], externalPosts };
	}
	try {
		const posts = await getPosts(env.DB);
		return { posts, externalPosts };
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		const causeMessage =
			err instanceof Error && err.cause instanceof Error
				? err.cause.message
				: "";
		const isD1Error =
			message.includes("no such table") ||
			message.includes("SQLITE_ERROR") ||
			message.includes("Failed query") ||
			causeMessage.includes("no such table");
		if (isD1Error) {
			console.warn(
				"[blog] D1 query failed (e.g. migrations not run). Returning empty posts. Run: wrangler d1 execute tokenoverflow-blog --remote --file=./migrations/0001_create_posts.sql",
			);
			return { posts: [], externalPosts };
		}
		console.error("[blog] D1 query failed:", err);
		throw new Response("Internal server error", { status: 500 });
	}
}

export function meta({ location }: Route.MetaArgs) {
	return buildMeta({
		title: "Writing on applied AI, RAG, and ML platforms",
		description:
			"Notes on production AI, retrieval-augmented generation, and MLOps by Harsh Solanki. Occasional posts on engineering patterns and lessons from the field.",
		path: location.pathname,
		keywords: [
			"AI blog",
			"RAG",
			"MLOps blog",
			"applied AI",
			"machine learning writing",
			"Harsh Solanki blog",
		],
	});
}

export default function Blog({ loaderData }: Route.ComponentProps) {
	const { posts, externalPosts } = loaderData;
	return (
		<div className="max-w-3xl mx-auto px-4 py-12">
			<pre className="font-mono text-xs text-volt-steel mb-2">
				~/$ ls blog/
			</pre>
			<h1 className="comic-heading text-3xl text-volt-snow mb-2">BLOG</h1>
			<p className="text-sm text-volt-steel mb-8">
				Occasional posts. Mostly for my future self.
			</p>
			<ul className="space-y-6">
				{posts.map((post) => (
					<li key={post.slug}>
						<article className="comic-card-hover p-5">
							<Link to={`/blog/${post.slug}`} className="block group">
								<h2 className="comic-heading text-xl text-volt-snow group-hover:text-volt-green transition mb-1">
									{post.title}
								</h2>
								<p className="text-xs text-volt-steel mb-2 font-mono">
									{post.date}
								</p>
								<p className="text-sm text-volt-steel">
									{post.excerpt}
								</p>
								<span className="font-display font-bold text-sm text-volt-snow group-hover:text-volt-green transition mt-2 inline-block">
									Read more →
								</span>
							</Link>
						</article>
					</li>
				))}
			</ul>
			{externalPosts.length > 0 && (
				<section className="mt-12 pt-8 border-t-2 border-volt-border">
					<h2 className="comic-heading text-xl text-volt-snow mb-4">
						Also on Medium
					</h2>
					<ul className="space-y-4">
						{externalPosts.map((post, i) => (
							<li key={post.url + i}>
								<a
									href={post.url}
									target="_blank"
									rel="noopener noreferrer"
									className="comic-card-hover p-5 block group no-underline"
								>
									<h3 className="comic-heading text-lg text-volt-snow group-hover:text-volt-green transition mb-1">
										{post.title}
									</h3>
									{post.date && (
										<p className="text-xs text-volt-steel mb-2 font-mono">
											{post.date}
										</p>
									)}
									<span className="font-display font-bold text-sm text-volt-snow group-hover:text-volt-green transition inline-block">
										Read on Medium →
									</span>
								</a>
							</li>
						))}
					</ul>
				</section>
			)}
		</div>
	);
}
