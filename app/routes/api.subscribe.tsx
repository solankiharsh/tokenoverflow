import type { Route } from "./+types/api.subscribe";
import { isValidEmail } from "../lib/email-validation";

export async function action({ request, context }: Route.ActionArgs) {
	if (request.method !== "POST") {
		return Response.json({ error: "Method not allowed" }, { status: 405 });
	}
	const formData = await request.formData();
	const email = formData.get("email");
	const value = typeof email === "string" ? email.trim() : "";
	if (!value) {
		return Response.json({ ok: false, error: "Email is required" }, { status: 400 });
	}
	if (!isValidEmail(value)) {
		return Response.json({ ok: false, error: "Invalid email address" }, { status: 400 });
	}
	const kv = (context.cloudflare.env as { SUBSCRIBERS?: KVNamespace }).SUBSCRIBERS;
	if (!kv) {
		return Response.json(
			{ ok: false, error: "Subscribe not configured" },
			{ status: 503 }
		);
	}
	const key = `subscriber:${value.toLowerCase()}`;
	await kv.put(key, new Date().toISOString());
	return Response.json({ ok: true });
}

export function loader() {
	return Response.json({ error: "Method not allowed" }, { status: 405 });
}
