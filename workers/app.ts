import { createRequestHandler } from "react-router";

declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
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

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const debug = url.searchParams.has("debug") || request.headers.get("X-Debug") === "1";
		try {
			return await requestHandler(request, {
				cloudflare: { env, ctx },
			});
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
