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
	children?: React.ReactNode;
}

export function PostEditor({
	values,
	onChange,
	submitLabel,
	children,
}: PostEditorProps) {
	const [preview, setPreview] = useState(false);

	const update = (patch: Partial<PostEditorValues>) => {
		onChange({ ...values, ...patch });
	};

	return (
		<div className="space-y-4">
			<div>
				<label className="font-mono text-sm text-[var(--terminal-text-muted)] block mb-1">
					Slug (URL path)
				</label>
				<input
					type="text"
					value={values.slug}
					onChange={(e) => update({ slug: e.target.value })}
					className="w-full font-mono text-sm bg-[var(--terminal-bg)] border border-[var(--terminal-border)] text-[var(--terminal-text)] px-3 py-2 rounded"
					placeholder="my-post-slug"
				/>
			</div>
			<div>
				<label className="font-mono text-sm text-[var(--terminal-text-muted)] block mb-1">
					Title
				</label>
				<input
					type="text"
					value={values.title}
					onChange={(e) => update({ title: e.target.value })}
					className="w-full font-mono text-sm bg-[var(--terminal-bg)] border border-[var(--terminal-border)] text-[var(--terminal-text)] px-3 py-2 rounded"
					placeholder="Post title"
				/>
			</div>
			<div>
				<label className="font-mono text-sm text-[var(--terminal-text-muted)] block mb-1">
					Excerpt
				</label>
				<input
					type="text"
					value={values.excerpt}
					onChange={(e) => update({ excerpt: e.target.value })}
					className="w-full font-mono text-sm bg-[var(--terminal-bg)] border border-[var(--terminal-border)] text-[var(--terminal-text)] px-3 py-2 rounded"
					placeholder="Short summary"
				/>
			</div>
			<div>
				<div className="flex items-center justify-between mb-1">
					<label className="font-mono text-sm text-[var(--terminal-text-muted)]">
						Content (Markdown)
					</label>
					<button
						type="button"
						onClick={() => setPreview((p) => !p)}
						className="font-mono text-xs text-[var(--terminal-accent)] hover:underline"
					>
						{preview ? "Edit" : "Preview"}
					</button>
				</div>
				{preview ? (
					<div className="min-h-[200px] rounded border border-[var(--terminal-border)] p-4 bg-[var(--terminal-bg)] prose prose-invert prose-sm max-w-none [&_a]:text-[var(--terminal-accent)] [&_pre]:bg-[var(--terminal-border)] [&_pre]:p-3 [&_pre]:rounded [&_code]:font-mono [&_code]:text-sm">
						<ReactMarkdown>{values.content}</ReactMarkdown>
					</div>
				) : (
					<textarea
						value={values.content}
						onChange={(e) => update({ content: e.target.value })}
						rows={16}
						className="w-full font-mono text-sm bg-[var(--terminal-bg)] border border-[var(--terminal-border)] text-[var(--terminal-text)] px-3 py-2 rounded resize-y"
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
						className="rounded border-[var(--terminal-border)]"
					/>
					<span className="font-mono text-sm text-[var(--terminal-text)]">
						Draft
					</span>
				</label>
				<label className="flex items-center gap-2">
					<input
						type="radio"
						checked={values.status === "published"}
						onChange={() => update({ status: "published" })}
						className="rounded border-[var(--terminal-border)]"
					/>
					<span className="font-mono text-sm text-[var(--terminal-text)]">
						Published
					</span>
				</label>
			</div>
			{children}
		</div>
	);
}
