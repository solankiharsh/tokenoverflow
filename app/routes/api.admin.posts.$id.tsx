import { redirect } from "react-router";
import type { Route } from "./+types/api.admin.posts.$id";
import { requireAdmin } from "../lib/admin-auth";
import { loadContextKey } from "../lib/load-context";
import { deletePost, updatePost } from "../data/blog";

export async function action(args: Route.ActionArgs) {
	await requireAdmin(args);
	const { id } = args.params;
	if (!id) throw new Response("Bad request", { status: 400 });

	const env = args.context.get(loadContextKey).cloudflare.env as { DB: Parameters<typeof updatePost>[0] };

	if (args.request.method === "DELETE") {
		await deletePost(env.DB, id);
		throw redirect("/admin", { status: 303 });
	}

	if (args.request.method === "PUT" || args.request.method === "PATCH") {
		const formData = await args.request.formData();
		const slug = formData.get("slug") ? String(formData.get("slug")).trim() : undefined;
		const title = formData.get("title") ? String(formData.get("title")).trim() : undefined;
		const excerpt = formData.get("excerpt") ? String(formData.get("excerpt")).trim() : undefined;
		const content = formData.get("content") ? String(formData.get("content")).trim() : undefined;
		const status = formData.get("status") as "draft" | "published" | undefined;
		await updatePost(env.DB, id, {
			...(slug !== undefined && { slug }),
			...(title !== undefined && { title }),
			...(excerpt !== undefined && { excerpt }),
			...(content !== undefined && { content }),
			...(status !== undefined && { status }),
		});
		throw redirect("/admin", { status: 303 });
	}

	throw new Response("Method not allowed", { status: 405 });
}
