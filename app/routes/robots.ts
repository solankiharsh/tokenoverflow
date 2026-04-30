import { SITE } from "../lib/seo";

const DISALLOWED_PATHS = [
	"/admin",
	"/admin/",
	"/api/",
	"/sign-in",
	"/sign-up",
	"/wiki",
];

const BAD_BOTS = [
	"GPTBot",
	"ChatGPT-User",
	"CCBot",
	"anthropic-ai",
	"Claude-Web",
	"Google-Extended",
	"PerplexityBot",
	"Bytespider",
	"Amazonbot",
	"FacebookBot",
];

export function loader() {
	const lines: string[] = [
		"# https://www.robotstxt.org/robotstxt.html",
		"User-agent: *",
		...DISALLOWED_PATHS.map((p) => `Disallow: ${p}`),
		"Allow: /",
		"",
		// Per-bot stanzas — uncomment any block to opt out specific crawlers.
		...BAD_BOTS.flatMap((bot) => [`# User-agent: ${bot}`, "# Disallow: /", ""]),
		`Sitemap: ${SITE.url}/sitemap.xml`,
		"",
	];

	return new Response(lines.join("\n"), {
		status: 200,
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600, s-maxage=86400",
			"X-Content-Type-Options": "nosniff",
		},
	});
}

// Resource route — no default export; React Router won't try to render it.
