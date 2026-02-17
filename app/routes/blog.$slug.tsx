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
	} catch (err) {
		if (err instanceof Response) throw err;
		console.error("[blog.$slug] loader error:", err);
		throw new Response("Internal server error", { status: 500 });
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
				className="font-display font-bold text-sm text-comic-gray-medium hover:text-comic-yellow transition mb-6 inline-block"
			>
				← BLOG
			</Link>
			<article>
				<h1 className="comic-heading text-3xl text-comic-black mb-2">
					{post.title}
				</h1>
				<p className="text-sm text-comic-gray-medium mb-6 font-mono">
					{post.date}
				</p>
				<div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:uppercase [&_a]:text-comic-black [&_a]:font-display [&_a]:font-bold [&_a]:underline hover:[&_a]:text-comic-yellow [&_pre]:bg-comic-gray [&_pre]:border-[3px] [&_pre]:border-comic-black [&_pre]:p-3 [&_code]:font-mono [&_code]:text-sm [&_code]:bg-comic-gray [&_code]:px-1">
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
				<h1 className="comic-heading text-2xl text-comic-black mb-4">
					404 — post not found
				</h1>
				<Link
					to="/blog"
					className="font-display font-bold text-comic-black hover:text-comic-yellow transition"
				>
					← BACK TO BLOG
				</Link>
			</div>
		);
	}
	throw error;
}
