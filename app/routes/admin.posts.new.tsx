import { Link, useFetcher } from "react-router";
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
	const fetcher = useFetcher();

	return (
		<div className="max-w-3xl mx-auto px-4 py-12">
			<Link
				to="/admin"
				className="font-display font-bold text-sm text-comic-gray-medium hover:text-comic-yellow transition mb-6 inline-block"
			>
				← ADMIN
			</Link>
			<h1 className="comic-heading text-2xl text-comic-black mb-6">
				NEW POST
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
						method: "POST",
						action: "/api/admin/posts",
					});
				}}
			>
				<PostEditor
					values={values}
					onChange={setValues}
					submitLabel="Create post"
					isSubmitting={fetcher.state !== "idle"}
				/>
			</form>
		</div>
	);
}
