import { Link, useFetcher } from "react-router";
import { useState, useEffect } from "react";
import type { Route } from "./+types/admin.posts.$id.edit";
import { requireAdmin } from "../lib/admin-auth";
import { getPostByIdForAdmin } from "../data/blog";
import { PostEditor, type PostEditorValues } from "../components/PostEditor";

export async function loader(args: Route.LoaderArgs) {
	await requireAdmin(args);
	const env = (args.context as unknown as { cloudflare: { env: { DB: Parameters<typeof getPostByIdForAdmin>[0] } } })
		.cloudflare.env;
	const post = await getPostByIdForAdmin(env.DB, args.params.id);
	if (!post) throw new Response("Not found", { status: 404 });
	return { post };
}

export function meta({ loaderData }: Route.MetaArgs) {
	if (!loaderData) return [{ title: "Edit | Admin" }];
	return [
		{ title: `Edit: ${loaderData.post.title} | Admin | Harsh Solanki` },
		{ name: "description", content: "Edit blog post." },
	];
}

export default function AdminPostsEdit({ loaderData }: Route.ComponentProps) {
	const { post } = loaderData;
	const [values, setValues] = useState<PostEditorValues>({
		slug: post.slug,
		title: post.title,
		excerpt: post.excerpt,
		content: post.content,
		status: post.status,
	});
	const fetcher = useFetcher();

	useEffect(() => {
		setValues({
			slug: post.slug,
			title: post.title,
			excerpt: post.excerpt,
			content: post.content,
			status: post.status,
		});
	}, [post]);

	return (
		<div className="max-w-3xl mx-auto px-4 py-12">
			<Link
				to="/admin"
				className="font-mono text-sm text-[var(--terminal-text-muted)] hover:text-[var(--terminal-accent)] hover:underline mb-6 inline-block"
			>
				← admin
			</Link>
			<h1 className="font-mono text-2xl text-[var(--terminal-accent)] mb-6">
				~/$ Edit: {post.title}
			</h1>
			<form
				className="space-y-6"
				onSubmit={(e) => {
					e.preventDefault();
					const formData = new FormData();
					formData.set("slug", values.slug);
					formData.set("title", values.title);
					formData.set("excerpt", values.excerpt);
					formData.set("content", values.content);
					formData.set("status", values.status);
					fetcher.submit(formData, {
						method: "PUT",
						action: `/api/admin/posts/${post.id}`,
					});
				}}
			>
				<PostEditor
					values={values}
					onChange={setValues}
					submitLabel="Save changes"
					isSubmitting={fetcher.state !== "idle"}
				/>
			</form>
		</div>
	);
}
