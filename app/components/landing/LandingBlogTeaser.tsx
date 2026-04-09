import { Link } from "react-router";
import type { BlogPost } from "../../data/blog";

export function LandingBlogTeaser({ posts }: { posts: BlogPost[] }) {
	if (posts.length === 0) {
		return (
			<section className="landing-section-muted py-20 sm:py-28 border-t border-white/[0.06]">
				<div className="max-w-6xl mx-auto px-4 text-center">
					<p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">
						From the blog
					</p>
					<h2 className="landing-heading text-2xl text-white mb-4">
						Writing to learn
					</h2>
					<p className="text-zinc-500 text-sm mb-6">
						Publish a post in your D1 CMS — it will show up here automatically.
					</p>
					<Link
						to="/blog"
						className="inline-flex text-cyan-400 text-sm font-medium hover:underline"
					>
						Open blog →
					</Link>
				</div>
			</section>
		);
	}

	return (
		<section className="landing-section-muted py-20 sm:py-28 border-t border-white/[0.06]">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex flex-wrap items-end justify-between gap-4 mb-10">
					<div>
						<p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400/90 mb-2">
							From the blog
						</p>
						<h2 className="landing-heading text-3xl text-white">
							Latest from D1
						</h2>
					</div>
					<Link
						to="/blog"
						className="text-sm text-zinc-400 hover:text-white transition-colors"
					>
						View all →
					</Link>
				</div>
				<ul className="grid md:grid-cols-3 gap-4">
					{posts.map((post) => (
						<li key={post.slug}>
							<Link
								to={`/blog/${post.slug}`}
								className="group block rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 hover:border-violet-500/25 hover:bg-white/[0.04] transition-all no-underline h-full"
							>
								<p className="font-mono text-[10px] text-zinc-500 mb-2">
									{post.date}
								</p>
								<h3 className="landing-heading text-lg text-white group-hover:text-cyan-300 transition-colors mb-2">
									{post.title}
								</h3>
								<p className="text-sm text-zinc-500 line-clamp-2">
									{post.excerpt}
								</p>
							</Link>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
