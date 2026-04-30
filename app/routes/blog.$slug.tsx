import { Link, useRouteError } from "react-router";
import ReactMarkdown from "react-markdown";
import type { Route } from "./+types/blog.$slug";
import { loadContextKey } from "../lib/load-context";
import { getPost } from "../data/blog";
import { blogPostingJsonLd, buildMeta } from "../lib/seo";

export async function loader(args: Route.LoaderArgs) {
	const env = args.context.get(loadContextKey).cloudflare.env as { DB?: Parameters<typeof getPost>[0] };
	if (!env?.DB) {
		throw new Response("Not found", { status: 404 });
	}
	try {
		const post = await getPost(env.DB, args.params.slug);
		if (!post) throw new Response("Not found", { status: 404 });
		return { post };
	} catch (err) {
		if (err instanceof Response) throw err;
		const message = err instanceof Error ? err.message : String(err);
		const causeMessage =
			err instanceof Error && err.cause instanceof Error
				? (err.cause as Error).message
				: "";
		const isD1Error =
			message.includes("no such table") ||
			message.includes("SQLITE_ERROR") ||
			message.includes("Failed query") ||
			causeMessage.includes("no such table");
		if (isD1Error) {
			console.warn("[blog.$slug] D1 query failed (e.g. migrations not run). Returning 404.");
			throw new Response("Not found", { status: 404 });
		}
		console.error("[blog.$slug] loader error:", err);
		throw new Response("Internal server error", { status: 500 });
	}
}

export function meta({ loaderData, params, location }: Route.MetaArgs) {
	const slug = params.slug ?? "";
	if (!loaderData) {
		return buildMeta({
			title: "Post not found",
			description: "This blog post could not be found.",
			path: location?.pathname ?? `/blog/${slug}`,
			noindex: true,
		});
	}
	const { post } = loaderData;
	const description = (post.excerpt && post.excerpt.trim().length > 0
		? post.excerpt
		: `${post.title} — a post by Harsh Solanki.`).slice(0, 300);
	return buildMeta({
		title: post.title,
		description,
		path: location?.pathname ?? `/blog/${slug}`,
		type: "article",
		publishedTime: post.date,
		modifiedTime: post.date,
		jsonLd: blogPostingJsonLd({
			title: post.title,
			description,
			slug: post.slug,
			publishedTime: post.date,
			modifiedTime: post.date,
		}),
	});
}


export default function BlogSlug({ loaderData }: Route.ComponentProps) {
	const { post } = loaderData;
	return (
		<div className="max-w-3xl mx-auto px-4 py-12">
			<Link
				to="/blog"
				className="font-display font-bold text-sm text-volt-steel hover:text-volt-green transition mb-6 inline-block"
			>
				← BLOG
			</Link>
			<article>
				<h1 className="comic-heading text-3xl text-volt-snow mb-2">
					{post.title}
				</h1>
				<p className="text-sm text-volt-steel mb-6 font-mono">
					{post.date}
				</p>
				<div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:uppercase [&_a]:text-volt-snow [&_a]:font-display [&_a]:font-bold [&_a]:underline hover:[&_a]:text-volt-green [&_pre]:bg-volt-carbon [&_pre]:border [&_pre]:border-volt-border [&_pre]:p-3 [&_code]:font-mono [&_code]:text-sm [&_code]:bg-volt-carbon [&_code]:px-1">
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
				<h1 className="comic-heading text-2xl text-volt-snow mb-4">
					404 — post not found
				</h1>
				<Link
					to="/blog"
					className="font-display font-bold text-volt-snow hover:text-volt-green transition"
				>
					← BACK TO BLOG
				</Link>
			</div>
		);
	}
	throw error;
}
