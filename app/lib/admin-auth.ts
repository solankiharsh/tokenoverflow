import { createClerkClient } from "@clerk/backend";
import { getAuth } from "@clerk/react-router/server";
import type { LoadContextValue } from "./load-context";
import { loadContextKey } from "./load-context";

/**
 * Role from JWT session claims. Clerk does not put user publicMetadata into the
 * session token by default; admins often add a custom claim in Dashboard →
 * Sessions → Customize session token, e.g. `"role": "{{user.public_metadata.role}}"`.
 */
function roleFromSessionClaims(sessionClaims: unknown): string | undefined {
	if (!sessionClaims || typeof sessionClaims !== "object") return undefined;
	const c = sessionClaims as Record<string, unknown>;
	if (typeof c.role === "string") return c.role;
	const metadata = c.metadata;
	if (metadata && typeof metadata === "object" && "role" in metadata) {
		const r = (metadata as { role?: unknown }).role;
		if (typeof r === "string") return r;
	}
	for (const key of ["publicMetadata", "public_metadata"] as const) {
		const pm = c[key];
		if (pm && typeof pm === "object" && "role" in pm) {
			const r = (pm as { role?: unknown }).role;
			if (typeof r === "string") return r;
		}
	}
	return undefined;
}

function getClerkSecretFromLoaderArgs(args: unknown): string | undefined {
	if (!args || typeof args !== "object" || !("context" in args)) return undefined;
	const ctx = (args as { context?: { get?: (k: unknown) => unknown } }).context;
	if (!ctx?.get) return undefined;
	try {
		const val = ctx.get(loadContextKey) as LoadContextValue | undefined;
		const env = val?.cloudflare?.env as { CLERK_SECRET_KEY?: string } | undefined;
		return env?.CLERK_SECRET_KEY;
	} catch {
		return undefined;
	}
}

async function isAdminUser(
	userId: string,
	sessionClaims: unknown,
	secretKey: string | undefined,
): Promise<boolean> {
	if (roleFromSessionClaims(sessionClaims) === "admin") return true;
	if (!secretKey) return false;
	try {
		const clerk = createClerkClient({ secretKey });
		const user = await clerk.users.getUser(userId);
		const role = user.publicMetadata?.role;
		return role === "admin";
	} catch {
		return false;
	}
}

/**
 * Call at the start of admin loaders/actions. Throws 403 if the user is not
 * signed in or does not have publicMetadata.role === "admin" (verified via
 * session claims when present, otherwise via Clerk Backend API when
 * CLERK_SECRET_KEY is set).
 */
export async function requireAdmin(
	args: Parameters<typeof getAuth>[0],
): Promise<void> {
	const { userId, sessionClaims } = await getAuth(args);
	if (!userId) {
		throw new Response("Forbidden", { status: 403 });
	}
	const secretKey = getClerkSecretFromLoaderArgs(args);
	const allowed = await isAdminUser(userId, sessionClaims, secretKey);
	if (!allowed) {
		throw new Response("Forbidden", { status: 403 });
	}
}
