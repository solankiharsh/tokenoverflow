import { Link, useFetcher } from "react-router";
import type { Route } from "./+types/admin";
import { requireAdmin } from "../lib/admin-auth";
import { loadContextKey } from "../lib/load-context";
import { getAllPostsAdmin } from "../data/blog";

export async function loader(args: Route.LoaderArgs) {
	await requireAdmin(args);
	const { cloudflare } = args.context.get(loadContextKey);
	const env = cloudflare.env as { DB: Parameters<typeof getAllPostsAdmin>[0] };
	const posts = await getAllPostsAdmin(env.DB);
	return { posts };
}

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Admin | Harsh Solanki" },
		{ name: "description", content: "Blog CMS admin." },
	];
}

export default function Admin({ loaderData }: Route.ComponentProps) {
	const { posts } = loaderData;
	const deleteFetcher = useFetcher();

	return (
		<div className="max-w-3xl mx-auto px-4 py-12">
			<h1 className="font-mono text-2xl text-[var(--terminal-accent)] mb-2">
				~/$ admin
			</h1>
			<p className="text-sm text-[var(--terminal-text-muted)] mb-6">
				Manage blog posts. Drafts are hidden from the public blog.
			</p>
			<Link
				to="/admin/posts/new"
				className="inline-block font-mono text-sm text-[var(--terminal-bg)] bg-[var(--terminal-accent)] px-3 py-2 rounded hover:opacity-90 mb-6"
			>
				+ New post
			</Link>
			<ul className="space-y-4">
				{posts.map((post) => (
					<li
						key={post.id}
						className="rounded border border-[var(--terminal-border)] p-4 flex flex-wrap items-center justify-between gap-2"
					>
						<div>
							<span className="font-mono text-xs text-[var(--terminal-text-muted)] mr-2">
								[{post.status}]
							</span>
							<span className="font-mono text-[var(--terminal-accent)]">
								{post.title}
							</span>
							<span className="text-[var(--terminal-text-muted)] text-sm ml-2">
								{post.date}
							</span>
						</div>
						<div className="flex gap-2">
							<Link
								to={`/admin/posts/${post.id}/edit`}
								className="font-mono text-xs text-[var(--terminal-accent)] hover:underline"
							>
								Edit
							</Link>
							<button
								type="button"
								className="font-mono text-xs text-red-400 hover:underline disabled:opacity-50"
								disabled={deleteFetcher.state !== "idle"}
								onClick={() => {
									if (!confirm("Delete this post?")) return;
									deleteFetcher.submit(null, {
										method: "DELETE",
										action: `/api/admin/posts/${post.id}`,
									});
								}}
							>
								{deleteFetcher.state !== "idle" ? "…" : "Delete"}
							</button>
						</div>
					</li>
				))}
			</ul>
			{posts.length === 0 && (
				<p className="text-[var(--terminal-text-muted)] text-sm">
					No posts yet. Create one above.
				</p>
			)}
		</div>
	);
}
