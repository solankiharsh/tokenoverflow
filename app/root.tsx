import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useRouteLoaderData,
} from "react-router";
import { clerkMiddleware, rootAuthLoader } from "@clerk/react-router/server";
import { ClerkProvider } from "@clerk/react-router";

import type { Route } from "./+types/root";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { terminalAppearance } from "./lib/clerk-appearance";
import { loadContextKey } from "./lib/load-context";
import "./app.css";

export const middleware = [clerkMiddleware()] as unknown as Route.MiddlewareFunction[];
export async function loader(args: Route.LoaderArgs) {
	const auth = await rootAuthLoader(args);
	const loadContext = args.context.get(loadContextKey);
	const debug = loadContext?.debug ?? false;
	const data = typeof auth === "object" && auth !== null ? auth : {};
	return { ...data, debug };
}

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:wght@400;500;600&display=swap",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="flex flex-col min-h-screen">
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App({ loaderData }: Route.ComponentProps) {
	return (
		<ClerkProvider
			publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? ""}
			loaderData={loaderData}
			appearance={terminalAppearance}
			afterSignOutUrl="/"
		>
			<Nav />
			<main className="flex-1">
				<Outlet />
			</main>
			<Footer />
		</ClerkProvider>
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
		<main className="max-w-3xl mx-auto px-4 py-16 font-mono text-[var(--terminal-text)]">
			<h1 className="text-xl text-[var(--terminal-accent)]">{message}</h1>
			<p className="text-sm text-[var(--terminal-text-muted)] mt-2">{details}</p>
			{stack && (
				<pre className="w-full p-4 mt-4 overflow-x-auto text-xs rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)]">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
