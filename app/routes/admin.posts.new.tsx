import { Link } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/admin.posts.new";
import { requireAdmin } from "../lib/admin-auth";
import { PostEditor, type PostEditorValues } from "../components/PostEditor";

export async function loader(args: Route.LoaderArgs) {
	await requireAdmin(args);
	return {};
}

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "New post | Admin | Harsh Solanki" },
		{ name: "description", content: "Write a new blog post." },
	];
}

const initial: PostEditorValues = {
	slug: "",
	title: "",
	excerpt: "",
	content: "",
	status: "draft",
};

export default function AdminPostsNew() {
	const [values, setValues] = useState<PostEditorValues>(initial);

	return (
		<div className="max-w-3xl mx-auto px-4 py-12">
			<Link
				to="/admin"
				className="font-mono text-sm text-[var(--terminal-text-muted)] hover:text-[var(--terminal-accent)] hover:underline mb-6 inline-block"
			>
				← admin
			</Link>
			<h1 className="font-mono text-2xl text-[var(--terminal-accent)] mb-6">
				~/$ New post
			</h1>
			<form method="post" action="/api/admin/posts" className="space-y-6">
				<input type="hidden" name="slug" value={values.slug} />
				<input type="hidden" name="title" value={values.title} />
				<input type="hidden" name="excerpt" value={values.excerpt} />
				<input type="hidden" name="content" value={values.content} />
				<input type="hidden" name="status" value={values.status} />
				<PostEditor values={values} onChange={setValues} submitLabel="Create post" />
			</form>
		</div>
	);
}
