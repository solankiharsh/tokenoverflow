import { getAuth } from "@clerk/react-router/server";

function isAdmin(sessionClaims: unknown): boolean {
	const meta = (sessionClaims as { publicMetadata?: { role?: string } })
		?.publicMetadata;
	return meta?.role === "admin";
}

/**
 * Call at the start of admin loaders/actions. Throws 403 if the user is not
 * signed in or does not have publicMetadata.role === "admin".
 */
export async function requireAdmin(
	args: Parameters<typeof getAuth>[0],
): Promise<void> {
	const { userId, sessionClaims } = await getAuth(args);
	if (!userId || !isAdmin(sessionClaims)) {
		throw new Response("Forbidden", { status: 403 });
	}
}
