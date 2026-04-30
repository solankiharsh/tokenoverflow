import { Link } from "react-router";
import type { BlogPost } from "../../data/blog";

function coverImageForPost(post: BlogPost): string {
	return `https://picsum.photos/seed/${encodeURIComponent(post.slug)}/800/460`;
}

export function LandingBlogTeaser({ posts }: { posts: BlogPost[] }) {
	if (posts.length === 0) {
		return (
			<section className="landing-section-muted py-20 sm:py-28 border-t border-volt-border">
				<div className="max-w-6xl mx-auto px-4 text-center">
					<p className="font-mono text-xs uppercase tracking-[0.28em] text-volt-steel mb-3">
						From the blog
					</p>
					<h2 className="landing-heading text-2xl text-volt-snow mb-4">
						Writing to learn
					</h2>
					<p className="text-volt-steel text-sm mb-6 tracking-wide">
						Publish a post in your D1 CMS — it will show up here automatically.
					</p>
					<Link
						to="/blog"
						className="inline-flex text-volt-mint text-sm font-medium hover:text-volt-green transition-colors"
					>
						Open blog →
					</Link>
				</div>
			</section>
		);
	}

	return (
		<section className="landing-section-muted py-20 sm:py-28 border-t border-volt-border">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex flex-wrap items-end justify-between gap-4 mb-10">
					<div>
						<p className="font-mono text-xs uppercase tracking-[0.28em] text-volt-mint mb-2">
							From the blog
						</p>
						<h2 className="landing-heading text-3xl text-volt-snow">
							Latest from D1
						</h2>
					</div>
					<Link
						to="/blog"
						className="text-sm text-volt-steel hover:text-volt-mint transition-colors"
					>
						View all →
					</Link>
				</div>
				<ul className="grid md:grid-cols-3 gap-4">
					{posts.map((post) => (
						<li key={post.slug}>
							<Link
								to={`/blog/${post.slug}`}
								className="group block overflow-hidden rounded-lg border border-volt-border bg-volt-carbon hover:border-volt-green/40 transition-all no-underline h-full shadow-[0_0_15px_rgba(92,88,85,0.15)]"
							>
								<div className="relative h-44 overflow-hidden border-b border-volt-border">
									<img
										src={coverImageForPost(post)}
										alt={`Cover image for ${post.title}`}
										loading="lazy"
										decoding="async"
										width={800}
										height={460}
										className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-volt-abyss/70 via-volt-abyss/20 to-transparent" />
								</div>
								<div className="p-5">
									<p className="font-mono text-[10px] text-volt-steel mb-2">
										{new Date(post.date).toLocaleDateString()}
									</p>
									<h3 className="landing-heading text-lg text-volt-snow group-hover:text-volt-mint transition-colors mb-2">
										{post.title}
									</h3>
									<p className="text-sm text-volt-parchment line-clamp-2 tracking-wide">
										{post.excerpt}
									</p>
								</div>
							</Link>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
