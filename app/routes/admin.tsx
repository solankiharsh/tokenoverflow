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
			<pre className="font-mono text-xs text-comic-gray-medium mb-2">
				~/$ admin
			</pre>
			<h1 className="comic-heading text-2xl text-comic-black mb-2">ADMIN</h1>
			<p className="text-sm text-comic-gray-medium mb-6">
				Manage blog posts. Drafts are hidden from the public blog.
			</p>
			<Link
				to="/admin/posts/new"
				className="comic-btn text-sm py-2 px-4 inline-block mb-6 no-underline"
			>
				+ NEW POST
			</Link>
			<ul className="space-y-4">
				{posts.map((post) => (
					<li
						key={post.id}
						className="comic-card p-4 flex flex-wrap items-center justify-between gap-2"
					>
						<div>
							<span className="font-mono text-xs text-comic-gray-medium mr-2">
								[{post.status}]
							</span>
							<span className="font-display font-bold text-comic-black">
								{post.title}
							</span>
							<span className="text-comic-gray-medium text-sm ml-2">
								{post.date}
							</span>
						</div>
						<div className="flex gap-2">
							<Link
								to={`/admin/posts/${post.id}/edit`}
								className="comic-btn-outline text-xs py-1.5 px-3 no-underline"
							>
								EDIT
							</Link>
							<button
								type="button"
								className="font-display font-bold text-sm text-red-600 hover:underline disabled:opacity-50"
								disabled={deleteFetcher.state !== "idle"}
								onClick={() => {
									if (!confirm("Delete this post?")) return;
									deleteFetcher.submit(null, {
										method: "DELETE",
										action: `/api/admin/posts/${post.id}`,
									});
								}}
							>
								{deleteFetcher.state !== "idle" ? "…" : "DELETE"}
							</button>
						</div>
					</li>
				))}
			</ul>
			{posts.length === 0 && (
				<p className="text-comic-gray-medium text-sm">
					No posts yet. Create one above.
				</p>
			)}
		</div>
	);
}
