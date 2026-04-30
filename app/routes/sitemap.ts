import type { Route } from "./+types/sitemap";
import { loadContextKey } from "../lib/load-context";
import { getPosts } from "../data/blog";
import { SITE } from "../lib/seo";

interface SitemapEntry {
	loc: string;
	lastmod?: string;
	changefreq?:
		| "always"
		| "hourly"
		| "daily"
		| "weekly"
		| "monthly"
		| "yearly"
		| "never";
	priority?: string;
}

const STATIC_ENTRIES: SitemapEntry[] = [
	{ loc: "/", changefreq: "weekly", priority: "1.0" },
	{ loc: "/about", changefreq: "monthly", priority: "0.8" },
	{ loc: "/projects", changefreq: "monthly", priority: "0.8" },
	{ loc: "/blog", changefreq: "weekly", priority: "0.9" },
];

function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function buildXml(entries: SitemapEntry[]): string {
	const urls = entries
		.map((entry) => {
			const loc = `${SITE.url}${entry.loc === "/" ? "/" : entry.loc}`;
			const parts: string[] = [`    <loc>${escapeXml(loc)}</loc>`];
			if (entry.lastmod) {
				parts.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
			}
			if (entry.changefreq) {
				parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
			}
			if (entry.priority) {
				parts.push(`    <priority>${entry.priority}</priority>`);
			}
			return `  <url>\n${parts.join("\n")}\n  </url>`;
		})
		.join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap-0.9">
${urls}
</urlset>
`;
}

export async function loader(args: Route.LoaderArgs) {
	const env = args.context.get(loadContextKey).cloudflare.env as {
		DB?: Parameters<typeof getPosts>[0];
	};

	const entries: SitemapEntry[] = [...STATIC_ENTRIES];

	if (env?.DB) {
		try {
			const posts = await getPosts(env.DB);
			for (const post of posts) {
				entries.push({
					loc: `/blog/${post.slug}`,
					lastmod: post.date ? toIsoDate(post.date) : undefined,
					changefreq: "monthly",
					priority: "0.7",
				});
			}
		} catch (err) {
			console.warn(
				"[sitemap] Failed to load posts; serving static-only sitemap.",
				err,
			);
		}
	}

	const xml = buildXml(entries);
	return new Response(xml, {
		status: 200,
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=600, s-maxage=3600",
			"X-Content-Type-Options": "nosniff",
		},
	});
}

function toIsoDate(input: string): string | undefined {
	const d = new Date(input);
	if (Number.isNaN(d.getTime())) return undefined;
	return d.toISOString();
}
