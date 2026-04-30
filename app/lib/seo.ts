/**
 * Central SEO config + meta builders.
 *
 * Single source of truth for canonical URLs, OpenGraph, Twitter Card,
 * and JSON-LD structured data. Use {@link buildMeta} from each route's
 * `meta` export so titles, descriptions, canonicals, and social cards
 * stay aligned with the audit rules (single H1 ≠ title, canonical
 * matches URL, OG/Twitter present, etc.).
 */

export const SITE = {
	url: "https://solharsh.com",
	name: "Harsh Solanki",
	shortName: "tokenoverflow",
	defaultTitle: "Harsh Solanki — Production AI systems that ship",
	titleTemplate: "%s | Harsh Solanki",
	defaultDescription:
		"Engineering Lead, Applied AI at Deriv. I architect production AI systems — multi-agent pipelines, trading engines, MLOps — and write about it occasionally.",
	defaultOgImage: "/og-default.png",
	defaultOgImageAlt:
		"Harsh Solanki — Production AI systems that ship. Engineering Lead, Applied AI.",
	twitter: "@HarshSolan24317",
	locale: "en_US",
	person: {
		name: "Harsh Solanki",
		jobTitle: "Engineering Lead, Applied AI",
		worksFor: "Deriv",
		location: "Dubai, UAE",
		sameAs: [
			"https://www.linkedin.com/in/solankiharsh/",
			"https://github.com/solankiharsh",
			"https://x.com/HarshSolan24317",
			"https://medium.com/@solharsh",
			"https://substack.com/@solankiharsh",
		],
	},
} as const;

/** Strip trailing slash except for the root "/", lowercase the path. */
export function canonicalPath(pathname: string): string {
	if (!pathname || pathname === "/") return "/";
	const lower = pathname.toLowerCase();
	return lower.length > 1 && lower.endsWith("/")
		? lower.slice(0, -1)
		: lower;
}

export function canonicalUrl(pathname: string): string {
	const path = canonicalPath(pathname);
	return path === "/" ? `${SITE.url}/` : `${SITE.url}${path}`;
}

export function absoluteUrl(maybeRelative: string): string {
	if (/^https?:\/\//i.test(maybeRelative)) return maybeRelative;
	const path = maybeRelative.startsWith("/")
		? maybeRelative
		: `/${maybeRelative}`;
	return `${SITE.url}${path}`;
}

// ---------------------------------------------------------------------------
// Title / description clamping helpers
// ---------------------------------------------------------------------------

/** Truncate `text` to at most `max` chars, breaking at the last word boundary. */
function truncateAtWord(text: string, max: number): string {
	if (text.length <= max) return text;
	const sliced = text.slice(0, max);
	const lastSpace = sliced.lastIndexOf(" ");
	return (lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced) + "…";
}

/**
 * Ensure a page title fits 30–65 chars.
 * - If the full title (which may already include " | Harsh Solanki") fits, keep it.
 * - If it's too long, strip the site-name suffix first, then truncate at a word boundary.
 */
export function clampTitle(fullTitle: string): string {
	const MAX = 65;
	if (fullTitle.length <= MAX) return fullTitle;
	// Try stripping the site-name suffix
	const stripped = fullTitle.replace(/ \| Harsh Solanki$/, "");
	if (stripped.length <= MAX) return stripped;
	return truncateAtWord(stripped, MAX);
}

/**
 * Ensure a meta description fits 70–160 chars.
 * Long descriptions are truncated at a word boundary with an ellipsis.
 * Short ones are returned as-is (forced padding would read unnaturally).
 */
export function clampDescription(text: string): string {
	const MAX = 160;
	if (text.length > MAX) return truncateAtWord(text, MAX);
	return text;
}

type JsonLd = Record<string, unknown>;

interface BuildMetaInput {
	/** Page-specific title (without site suffix). */
	title?: string;
	/** Full page <title> override (skips titleTemplate). */
	fullTitle?: string;
	description?: string;
	/** Path on the site, e.g. from `location.pathname`. */
	path: string;
	/** Override the OG image for this page (relative or absolute). */
	image?: string;
	imageAlt?: string;
	/** Open Graph type — "website" for landing pages, "article" for posts. */
	type?: "website" | "article" | "profile";
	/** ISO timestamp for article published time. */
	publishedTime?: string;
	/** ISO timestamp for article modified time. */
	modifiedTime?: string;
	keywords?: string[];
	/** Set true for pages that should not be indexed (admin, sign-in, etc.). */
	noindex?: boolean;
	/** Inject JSON-LD structured data for this page. */
	jsonLd?: JsonLd | JsonLd[];
}

type MetaDescriptor =
	| { title: string }
	| { name: string; content: string }
	| { property: string; content: string }
	| { tagName: "link"; rel: string; href: string; [k: string]: string }
	| { "script:ld+json": JsonLd };

export function buildMeta(input: BuildMetaInput): MetaDescriptor[] {
	const {
		title,
		fullTitle,
		description = SITE.defaultDescription,
		path,
		image,
		imageAlt,
		type = "website",
		publishedTime,
		modifiedTime,
		keywords,
		noindex = false,
		jsonLd,
	} = input;

	const rawTitle = fullTitle
		? fullTitle
		: title
			? SITE.titleTemplate.replace("%s", title)
			: SITE.defaultTitle;

	const resolvedTitle = clampTitle(rawTitle);
	const resolvedDescription = clampDescription(description);

	const url = canonicalUrl(path);
	const ogImage = absoluteUrl(image ?? SITE.defaultOgImage);
	const ogImageAlt = imageAlt ?? SITE.defaultOgImageAlt;

	const tags: MetaDescriptor[] = [
		{ title: resolvedTitle },
		{ name: "description", content: resolvedDescription },
		{ tagName: "link", rel: "canonical", href: url },

		// Robots
		{
			name: "robots",
			content: noindex
				? "noindex, nofollow"
				: "index, follow, max-image-preview:large, max-snippet:-1",
		},

		// Open Graph
		{ property: "og:type", content: type },
		{ property: "og:site_name", content: SITE.name },
		{ property: "og:locale", content: SITE.locale },
		{ property: "og:title", content: resolvedTitle },
		{ property: "og:description", content: resolvedDescription },
		{ property: "og:url", content: url },
		{ property: "og:image", content: ogImage },
		{ property: "og:image:alt", content: ogImageAlt },
		{ property: "og:image:width", content: "1200" },
		{ property: "og:image:height", content: "630" },

		// Twitter / X
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:site", content: SITE.twitter },
		{ name: "twitter:creator", content: SITE.twitter },
		{ name: "twitter:title", content: resolvedTitle },
		{ name: "twitter:description", content: resolvedDescription },
		{ name: "twitter:image", content: ogImage },
		{ name: "twitter:image:alt", content: ogImageAlt },
	];

	if (publishedTime) {
		tags.push({ property: "article:published_time", content: publishedTime });
	}
	if (modifiedTime) {
		tags.push({ property: "article:modified_time", content: modifiedTime });
	}
	if (keywords && keywords.length > 0) {
		tags.push({ name: "keywords", content: keywords.join(", ") });
	}

	if (jsonLd) {
		const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
		for (const block of blocks) {
			tags.push({ "script:ld+json": block });
		}
	}

	return tags;
}

/**
 * Site-wide default meta for `root.tsx`. Emits OG/Twitter/robots fallbacks
 * + Person/WebSite JSON-LD that should appear on every page. Deliberately
 * omits the `<link rel="canonical">` tag — canonicals are page-specific
 * and emitted by each leaf route's `buildMeta` call. Leaving the canonical
 * out here avoids the risk of duplicate canonical tags if React Router's
 * `<link>` deduplication ever differs between versions.
 */
export function rootMeta(): MetaDescriptor[] {
	const ogImage = absoluteUrl(SITE.defaultOgImage);
	const desc = clampDescription(SITE.defaultDescription);

	const tags: MetaDescriptor[] = [
		{ title: SITE.defaultTitle },
		{ name: "description", content: desc },
		{
			name: "robots",
			content: "index, follow, max-image-preview:large, max-snippet:-1",
		},

		{ property: "og:type", content: "website" },
		{ property: "og:site_name", content: SITE.name },
		{ property: "og:locale", content: SITE.locale },
		{ property: "og:title", content: SITE.defaultTitle },
		{ property: "og:description", content: desc },
		{ property: "og:url", content: SITE.url },
		{ property: "og:image", content: ogImage },
		{ property: "og:image:alt", content: SITE.defaultOgImageAlt },
		{ property: "og:image:width", content: "1200" },
		{ property: "og:image:height", content: "630" },

		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:site", content: SITE.twitter },
		{ name: "twitter:creator", content: SITE.twitter },
		{ name: "twitter:title", content: SITE.defaultTitle },
		{ name: "twitter:description", content: desc },
		{ name: "twitter:image", content: ogImage },
		{ name: "twitter:image:alt", content: SITE.defaultOgImageAlt },
	];

	for (const block of siteJsonLd()) {
		tags.push({ "script:ld+json": block });
	}
	return tags;
}

/**
 * Default site-wide JSON-LD: a Person + WebSite block. Emit once on the
 * home page so search engines understand the site identity and enable
 * sitelinks search box.
 */
export function siteJsonLd(): JsonLd[] {
	return [
		{
			"@context": "https://schema.org",
			"@type": "Person",
			name: SITE.person.name,
			jobTitle: SITE.person.jobTitle,
			worksFor: { "@type": "Organization", name: SITE.person.worksFor },
			url: SITE.url,
			image: absoluteUrl(SITE.defaultOgImage),
			address: {
				"@type": "PostalAddress",
				addressLocality: SITE.person.location,
			},
			sameAs: [...SITE.person.sameAs],
		},
		{
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: SITE.name,
			url: SITE.url,
			inLanguage: "en",
		},
	];
}

export function blogPostingJsonLd(input: {
	title: string;
	description: string;
	slug: string;
	publishedTime?: string;
	modifiedTime?: string;
}): JsonLd {
	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: input.title,
		description: input.description,
		url: canonicalUrl(`/blog/${input.slug}`),
		datePublished: input.publishedTime,
		dateModified: input.modifiedTime ?? input.publishedTime,
		author: {
			"@type": "Person",
			name: SITE.person.name,
			url: SITE.url,
		},
		publisher: {
			"@type": "Person",
			name: SITE.person.name,
			url: SITE.url,
		},
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": canonicalUrl(`/blog/${input.slug}`),
		},
		image: absoluteUrl(SITE.defaultOgImage),
		inLanguage: "en",
	};
}
