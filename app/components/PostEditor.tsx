import { useState } from "react";
import ReactMarkdown from "react-markdown";

export interface PostEditorValues {
	slug: string;
	title: string;
	excerpt: string;
	content: string;
	status: "draft" | "published";
}

interface PostEditorProps {
	values: PostEditorValues;
	onChange: (values: PostEditorValues) => void;
	submitLabel: string;
	/** When true, submit button shows "Saving…" and is disabled */
	isSubmitting?: boolean;
	children?: React.ReactNode;
}

export function PostEditor({
	values,
	onChange,
	submitLabel,
	isSubmitting = false,
	children,
}: PostEditorProps) {
	const [preview, setPreview] = useState(false);

	const update = (patch: Partial<PostEditorValues>) => {
		onChange({ ...values, ...patch });
	};

	return (
		<div className="space-y-4">
			<div>
				<label className="font-display font-bold text-sm text-comic-gray-medium block mb-1 uppercase">
					Slug (URL path)
				</label>
				<input
					type="text"
					value={values.slug}
					onChange={(e) => update({ slug: e.target.value })}
					className="w-full font-mono text-sm bg-comic-white border-[3px] border-comic-black text-comic-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-comic-yellow"
					placeholder="my-post-slug"
				/>
			</div>
			<div>
				<label className="font-display font-bold text-sm text-comic-gray-medium block mb-1 uppercase">
					Title
				</label>
				<input
					type="text"
					value={values.title}
					onChange={(e) => update({ title: e.target.value })}
					className="w-full font-mono text-sm bg-comic-white border-[3px] border-comic-black text-comic-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-comic-yellow"
					placeholder="Post title"
				/>
			</div>
			<div>
				<label className="font-display font-bold text-sm text-comic-gray-medium block mb-1 uppercase">
					Excerpt
				</label>
				<input
					type="text"
					value={values.excerpt}
					onChange={(e) => update({ excerpt: e.target.value })}
					className="w-full font-mono text-sm bg-comic-white border-[3px] border-comic-black text-comic-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-comic-yellow"
					placeholder="Short summary"
				/>
			</div>
			<div>
				<div className="flex items-center justify-between mb-1">
					<label className="font-display font-bold text-sm text-comic-gray-medium uppercase">
						Content (Markdown)
					</label>
					<button
						type="button"
						onClick={() => setPreview((p) => !p)}
						className="font-display font-bold text-xs text-comic-black hover:text-comic-yellow transition"
					>
						{preview ? "Edit" : "Preview"}
					</button>
				</div>
				{preview ? (
					<div className="min-h-[200px] border-[3px] border-comic-black p-4 bg-comic-gray prose prose-sm max-w-none [&_a]:text-comic-black [&_a]:font-display [&_a]:font-bold hover:[&_a]:text-comic-yellow [&_pre]:bg-comic-white [&_pre]:border-2 [&_pre]:border-comic-black [&_pre]:p-3 [&_code]:font-mono [&_code]:text-sm [&_code]:bg-comic-gray [&_code]:px-1">
						<ReactMarkdown>{values.content}</ReactMarkdown>
					</div>
				) : (
					<textarea
						value={values.content}
						onChange={(e) => update({ content: e.target.value })}
						rows={16}
						className="w-full font-mono text-sm bg-comic-white border-[3px] border-comic-black text-comic-black px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-comic-yellow"
						placeholder="Write in Markdown..."
					/>
				)}
			</div>
			<div className="flex items-center gap-4">
				<label className="flex items-center gap-2">
					<input
						type="radio"
						checked={values.status === "draft"}
						onChange={() => update({ status: "draft" })}
						className="border-2 border-comic-black"
					/>
					<span className="font-mono text-sm text-comic-black">Draft</span>
				</label>
				<label className="flex items-center gap-2">
					<input
						type="radio"
						checked={values.status === "published"}
						onChange={() => update({ status: "published" })}
						className="border-2 border-comic-black"
					/>
					<span className="font-mono text-sm text-comic-black">Published</span>
				</label>
			</div>
			<button
				type="submit"
				className="comic-btn text-sm py-2 px-5 disabled:opacity-50"
				disabled={isSubmitting}
			>
				{isSubmitting ? "Saving…" : submitLabel}
			</button>
			{children}
		</div>
	);
}
