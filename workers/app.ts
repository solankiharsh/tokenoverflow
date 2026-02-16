import { createRequestHandler } from "react-router";

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
		const loadContext = {
			cloudflare: { env, ctx },
			debug,
		};
		try {
			const response = await requestHandler(request, loadContext);
			if (response.status === 500 && debug) {
				return new Response(DEBUG_500_HTML, {
					status: 500,
					headers: { "Content-Type": "text/html; charset=utf-8" },
				});
			}
			return response;
		} catch (error) {
			const message = getErrorMessage(error);
			console.error("[tokenoverflow] Unexpected server error:", message, error);
			if (debug) {
				return new Response(
					`<pre style="font-family:monospace;white-space:pre-wrap;padding:1rem;">Unexpected Server Error\n\n${message}${error instanceof Error && error.stack ? "\n\n" + error.stack : ""}</pre>`,
					{ status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } },
				);
			}
			return new Response("Unexpected Server Error", { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;
