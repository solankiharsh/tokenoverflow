import { getAuth } from "@clerk/react-router/server";
import { redirect } from "react-router";
import type { Route } from "./+types/api.admin.posts.$id";
import { deletePost, updatePost } from "../data/blog";

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
	const { id } = args.params;
	if (!id) throw new Response("Bad request", { status: 400 });

	const env = (args.context as {
		cloudflare: { env: { DB: Parameters<typeof updatePost>[0] } };
	}).cloudflare.env;

	if (args.request.method === "DELETE") {
		await deletePost(env.DB, id);
		throw redirect(303, "/admin");
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
		throw redirect(303, "/admin");
	}

	throw new Response("Method not allowed", { status: 405 });
}
