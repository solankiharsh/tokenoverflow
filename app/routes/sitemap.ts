import type { Route } from "./+types/sitemap";
import { loadContextKey } from "../lib/load-context";
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

// Build-time lastmod stamps so auditors see freshness on static pages.
const BUILD_DATE = "2026-04-30";

const STATIC_ENTRIES: SitemapEntry[] = [
	{ loc: "/", changefreq: "weekly", priority: "1.0", lastmod: BUILD_DATE },
	{ loc: "/about", changefreq: "monthly", priority: "0.8", lastmod: BUILD_DATE },
	{ loc: "/projects", changefreq: "monthly", priority: "0.8", lastmod: BUILD_DATE },
	{ loc: "/blog", changefreq: "weekly", priority: "0.9", lastmod: BUILD_DATE },
];

const SITEMAP_HEADERS = {
	"Content-Type": "application/xml; charset=utf-8",
	"Cache-Control": "public, max-age=600, s-maxage=3600",
	"X-Content-Type-Options": "nosniff",
};

/** Only allow URL-safe slug characters; rejects empty strings and control chars. */
function isSafeSlug(slug: unknown): slug is string {
	if (typeof slug !== "string" || slug.trim() === "") return false;
	return /^[a-zA-Z0-9-._~]+$/.test(slug);
}

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

function toIsoDate(input: string): string | undefined {
	const d = new Date(input);
	if (Number.isNaN(d.getTime())) return undefined;
	return d.toISOString().slice(0, 10);
}

export async function loader(args: Route.LoaderArgs) {
	try {
		// Safely extract env — context.get() can throw if key is missing
		const env = (args.context.get(loadContextKey)?.cloudflare?.env ?? {}) as {
			DB?: D1Database;
		};

		const entries: SitemapEntry[] = [...STATIC_ENTRIES];

		if (env.DB) {
			try {
				// Lazy-import so a module-init error in blog.ts never crashes the sitemap
				const { getPosts } = await import("../data/blog");
				const posts = await getPosts(env.DB);
				for (const p of posts) {
					if (!isSafeSlug(p.slug)) continue;
					entries.push({
						loc: `/blog/${p.slug}`,
						lastmod: p.date ? toIsoDate(p.date) : undefined,
						changefreq: "monthly",
						priority: "0.7",
					});
				}
			} catch (err) {
				console.warn("[sitemap] D1 query failed; serving static-only sitemap.", err);
			}
		}

		return new Response(buildXml(entries), { status: 200, headers: SITEMAP_HEADERS });
	} catch (err) {
		// Fatal guard: always return a valid XML response — never let sitemap 500
		console.error("[sitemap] fatal error; serving fallback sitemap.", err);
		return new Response(buildXml(STATIC_ENTRIES), { status: 200, headers: SITEMAP_HEADERS });
	}
}
