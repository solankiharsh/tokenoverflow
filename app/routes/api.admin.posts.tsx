import { getAuth } from "@clerk/react-router/server";
import { redirect } from "react-router";
import type { Route } from "./+types/api.admin.posts";
import { createPost } from "../data/blog";

function isAdmin(sessionClaims: unknown): boolean {
	const meta = (sessionClaims as { publicMetadata?: { role?: string } })
		?.publicMetadata;
	return meta?.role === "admin";
}

export async function action(args: Route.ActionArgs) {
	const { userId, sessionClaims } = await getAuth(args);
	if (!userId || !isAdmin(sessionClaims)) {
		throw new Response("Forbidden", { status: 403 });
	}
	const formData = await args.request.formData();
	const slug = String(formData.get("slug") ?? "").trim();
	const title = String(formData.get("title") ?? "").trim();
	const excerpt = String(formData.get("excerpt") ?? "").trim();
	const content = String(formData.get("content") ?? "").trim();
	const status = (formData.get("status") as "draft" | "published") ?? "draft";
	if (!slug || !title || !content) {
		return new Response("Missing slug, title, or content", { status: 400 });
	}
	const env = (args.context as { cloudflare: { env: { DB: Parameters<typeof createPost>[0] } } })
		.cloudflare.env;
	await createPost(env.DB, { slug, title, excerpt, content, status });
	throw redirect(303, "/admin");
}
