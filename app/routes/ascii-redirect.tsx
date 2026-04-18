import { redirect } from "react-router";

/**
 * Legacy alias. Redirects /ascii and /vk to the rebranded V-K route.
 * Uses a 302 so we can rename again later without caching pain.
 */
export function loader() {
	return redirect("/voight-kampff");
}

export default function AsciiRedirect() {
	return null;
}
