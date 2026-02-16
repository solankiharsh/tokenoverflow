import { createContext } from "react-router";

/**
 * Value we inject from the Cloudflare Worker (getLoadContext).
 * When middleware is enabled, loaders/actions receive a RouterContextProvider;
 * use context.get(loadContextKey) to get this value.
 */
export interface LoadContextValue {
	cloudflare: { env: unknown; ctx: unknown };
	debug?: boolean;
}

export const loadContextKey = createContext<LoadContextValue>();
