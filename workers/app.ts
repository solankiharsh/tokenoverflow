import { createRequestHandler, RouterContextProvider } from "react-router";
import { loadContextKey } from "../app/lib/load-context";

declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
		debug?: boolean;
	}
}

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

function getErrorMessage(err: unknown): string {
	if (err instanceof Error) return err.message;
	if (typeof err === "string") return err;
	return String(err);
}

/**
 * Build a Content-Security-Policy that covers every third-party origin the
 * app loads. Keep this in lockstep with `root.tsx` and any dependency that
 * fetches scripts/fonts/images at runtime (Clerk, Google Fonts, Cloudflare
 * Turnstile, the Cloak DMG host).
 *
 * Notes on `'unsafe-inline'`:
 *   - React Router currently injects an inline route-manifest script. Without
 *     a build-time nonce/hash flow, blocking inline scripts breaks hydration.
 *   - Tailwind ships some inline styles via the runtime preflight; allowing
 *     `'unsafe-inline'` for `style-src` is the pragmatic default until/unless
 *     we adopt a CSP nonce strategy.
 */
const CSP = [
	"default-src 'self'",
	"base-uri 'self'",
	"object-src 'none'",
	"frame-ancestors 'self'",
	"form-action 'self' https://*.clerk.accounts.dev https://*.clerk.com",
	[
		"script-src 'self' 'unsafe-inline'",
		"https://*.clerk.accounts.dev",
		"https://*.clerk.com",
		"https://challenges.cloudflare.com",
	].join(" "),
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"font-src 'self' data: https://fonts.gstatic.com",
	[
		"img-src 'self' data: blob: https:",
	].join(" "),
	[
		"connect-src 'self'",
		"https://*.clerk.accounts.dev",
		"https://*.clerk.com",
		"https://api.clerk.com",
		"https://clerk-telemetry.com",
	].join(" "),
	[
		"frame-src 'self'",
		"https://*.clerk.accounts.dev",
		"https://*.clerk.com",
		"https://challenges.cloudflare.com",
		"https://www.youtube.com",
		"https://player.vimeo.com",
	].join(" "),
	[
		"worker-src 'self' blob:",
	].join(" "),
	"upgrade-insecure-requests",
].join("; ");

/**
 * Apply security + caching headers to every response. Skipped when the
 * upstream handler already set the same header so explicit per-route
 * controls (e.g. sitemap caching) win.
 */
function applySecurityHeaders(response: Response, request: Request): Response {
	const url = new URL(request.url);
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
	// HSTS only meaningful on HTTPS; safe to skip on local dev (http://localhost).
	if (url.protocol === "https:") {
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

const DEBUG_500_HTML = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Server Error</title></head>
<body style="font-family:system-ui,sans-serif;max-width:42rem;margin:2rem auto;padding:1rem;">
  <h1>Server returned 500</h1>
  <p>The error was logged server-side. To see the actual message:</p>
  <ol>
    <li>Open <strong>Cloudflare Dashboard</strong> → Workers &amp; Pages → this worker</li>
    <li>Go to <strong>Logs</strong> → <strong>Real-time Logs</strong></li>
    <li>Reload this page, then look for lines starting with <code>[tokenoverflow] Server error:</code> or <code>[tokenoverflow] Unexpected server error:</code></li>
  </ol>
  <p>Common causes: missing <strong>CLERK_PUBLISHABLE_KEY</strong> / <strong>CLERK_SECRET_KEY</strong> in the worker’s Variables/Secrets, or missing <strong>D1</strong> binding / migrations not run on production.</p>
</body></html>`;

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const debug = url.searchParams.has("debug") || request.headers.get("X-Debug") === "1";
		const requestContext = new RouterContextProvider();
		const cloudflare = { env, ctx };
		requestContext.set(loadContextKey, { cloudflare, debug });
		// Expose cloudflare.env so Clerk's getEnvVariable (context.cloudflare.env) finds CLERK_* keys
		(requestContext as unknown as { cloudflare: typeof cloudflare }).cloudflare = cloudflare;
		try {
			const response = await requestHandler(request, requestContext);
			if (response.status === 500 && debug) {
				return applySecurityHeaders(
					new Response(DEBUG_500_HTML, {
						status: 500,
						headers: { "Content-Type": "text/html; charset=utf-8" },
					}),
					request,
				);
			}
			return applySecurityHeaders(response, request);
		} catch (error) {
			const message = getErrorMessage(error);
			console.error("[tokenoverflow] Unexpected server error:", message, error);
			if (debug) {
				return applySecurityHeaders(
					new Response(
						`<pre style="font-family:monospace;white-space:pre-wrap;padding:1rem;">Unexpected Server Error\n\n${message}${error instanceof Error && error.stack ? "\n\n" + error.stack : ""}</pre>`,
						{ status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } },
					),
					request,
				);
			}
			return applySecurityHeaders(
				new Response("Unexpected Server Error", { status: 500 }),
				request,
			);
		}
	},
} satisfies ExportedHandler<Env>;
