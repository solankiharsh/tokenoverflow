import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useRouteLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { loadContextKey } from "./lib/load-context";
import { rootMeta } from "./lib/seo";
import "./app.css";

export async function loader(args: Route.LoaderArgs) {
	const loadContext = args.context.get(loadContextKey);
	const debug = loadContext?.debug ?? false;
	return { debug };
}

const FONTS_HREF =
	"https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap";

export const links: Route.LinksFunction = () => [
	// DNS prefetch — polyfill for older proxies that don't honour preconnect
	{ rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
	{ rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
	// Preconnect for the actual font CDN (avoids TLS negotiation cost)
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	// Preload the font CSS so the browser discovers it early …
	{
		rel: "preload",
		as: "style",
		href: FONTS_HREF,
	},
	// … then load it non-render-blocking via media="print" + onload swap trick.
	// The onload is handled by an inline <script> in Layout below to keep TSX clean.
	{
		rel: "stylesheet",
		href: FONTS_HREF,
		media: "print",
		id: "google-fonts-sheet",
	},
	{ rel: "icon", href: "/favicon.ico", sizes: "any" },
	{ rel: "apple-touch-icon", href: "/favicon.ico" },
	{ rel: "sitemap", type: "application/xml", href: "/sitemap.xml" },
	{
		rel: "me",
		href: "https://www.linkedin.com/in/solankiharsh/",
	},
];

/**
 * Site-wide default meta. Individual routes extend or override these via
 * their own `meta` exports — React Router merges by name/property so route
 * exports take precedence. Canonical URLs are intentionally NOT emitted
 * here; each leaf route emits its own via `buildMeta` to avoid duplicates.
 */
export function meta() {
	return rootMeta();
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="theme-color" content="#0a0e0d" />
				<meta name="color-scheme" content="dark" />
				<meta name="format-detection" content="telephone=no" />
				<meta name="author" content="Harsh Solanki" />
				<Meta />
				<Links />
				{/* Switch the font stylesheet from print → all once it finishes loading,
				    making it non-render-blocking. noscript ensures fonts load without JS. */}
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: trusted inline performance snippet
					dangerouslySetInnerHTML={{
						__html: `(function(){var l=document.getElementById('google-fonts-sheet');if(l){l.onload=function(){l.media='all'};l.onerror=function(){l.media='all'}}})();`,
					}}
				/>
				<noscript>
					<link
						rel="stylesheet"
						href={FONTS_HREF}
					/>
				</noscript>
			</head>
			<body className="flex flex-col min-h-screen font-sans antialiased bg-volt-abyss text-volt-snow">
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return (
		<>
			<Nav />
			<main className="flex-1">
				<Outlet />
			</main>
			<Footer />
		</>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	const rootData = useRouteLoaderData("root") as { debug?: boolean } | undefined;
	const showDetails = import.meta.env.DEV || rootData?.debug === true;

	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (showDetails && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="max-w-3xl mx-auto px-4 py-16 volt-page">
			<h1 className="comic-heading text-2xl">{message}</h1>
			<p className="text-sm text-volt-steel mt-2">{details}</p>
			{stack && (
				<pre className="w-full p-4 mt-4 overflow-x-auto text-xs font-mono rounded-lg border border-volt-border bg-volt-carbon text-volt-mint">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
