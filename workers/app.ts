/**
 * Serves the reconstructed solharsh.com deployment from static assets and
 * forwards the existing traffic counter API to its Pages-backed KV function.
 */

const CSP = [
	"default-src 'self'",
	"base-uri 'self'",
	"object-src 'none'",
	"frame-ancestors 'self'",
	"form-action 'self'",
	"script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://cdn.jsdelivr.net",
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"font-src 'self' data: https://fonts.gstatic.com",
	"img-src 'self' data: blob: https:",
	"connect-src 'self' https://cdn.jsdelivr.net",
	"frame-src 'self' https://challenges.cloudflare.com https://www.youtube.com https://player.vimeo.com",
	"worker-src 'self' blob:",
	"upgrade-insecure-requests",
].join("; ");

function applySecurityHeaders(response: Response, request: Request): Response {
	const headers = new Headers(response.headers);
	const setIfMissing = (name: string, value: string) => {
		if (!headers.has(name)) headers.set(name, value);
	};

	setIfMissing("X-Content-Type-Options", "nosniff");
	setIfMissing("X-Frame-Options", "SAMEORIGIN");
	setIfMissing("Referrer-Policy", "strict-origin-when-cross-origin");
	setIfMissing(
		"Permissions-Policy",
		"camera=(), microphone=(), geolocation=(), interest-cohort=()",
	);
	setIfMissing("X-DNS-Prefetch-Control", "on");
	setIfMissing("Cross-Origin-Opener-Policy", "same-origin");
	if (new URL(request.url).protocol === "https:") {
		setIfMissing(
			"Strict-Transport-Security",
			"max-age=63072000; includeSubDomains; preload",
		);
	}
	setIfMissing("Content-Security-Policy", CSP);
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		if (url.pathname === "/api/traffic") {
			if (request.method !== "POST" && request.method !== "OPTIONS") {
				return applySecurityHeaders(
					new Response("Method Not Allowed", { status: 405 }),
					request,
				);
			}

			const upstreamUrl = new URL(
				`${url.pathname}${url.search}`,
				"https://a002fcb2.portfolio-ag9.pages.dev",
			);
			const headers = new Headers(request.headers);
			const clientIp = request.headers.get("CF-Connecting-IP");
			if (clientIp) headers.set("X-Forwarded-For", clientIp);
			const upstream = await fetch(
				new Request(upstreamUrl, {
					method: request.method,
					headers,
					body: request.method === "POST" ? request.body : undefined,
					redirect: "manual",
				}),
			);
			return applySecurityHeaders(upstream, request);
		}

		const assets = (env as Env & { ASSETS: Fetcher }).ASSETS;
		return applySecurityHeaders(await assets.fetch(request), request);
	},
} satisfies ExportedHandler<Env>;
