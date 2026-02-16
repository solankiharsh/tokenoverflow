import { redirect } from "react-router";
import type { Route } from "./+types/api.admin.posts";
import { requireAdmin } from "../lib/admin-auth";
import { loadContextKey } from "../lib/load-context";
import { createPost } from "../data/blog";

export async function action(args: Route.ActionArgs) {
	await requireAdmin(args);
	const formData = await args.request.formData();
	const slug = String(formData.get("slug") ?? "").trim();
	const title = String(formData.get("title") ?? "").trim();
	const excerpt = String(formData.get("excerpt") ?? "").trim();
	const content = String(formData.get("content") ?? "").trim();
	const status = (formData.get("status") as "draft" | "published") ?? "draft";
	if (!slug || !title || !content) {
		return new Response("Missing slug, title, or content", { status: 400 });
	}
	const env = args.context.get(loadContextKey).cloudflare.env as { DB: Parameters<typeof createPost>[0] };
	await createPost(env.DB, { slug, title, excerpt, content, status });
	throw redirect("/admin", { status: 303 });
}
