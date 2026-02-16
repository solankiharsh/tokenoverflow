import { useFetcher } from "react-router";
import { useEffect, useState } from "react";

export function SubscribeForm() {
	const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
	const [email, setEmail] = useState("");
	const isSubmitting = fetcher.state !== "idle";
	const isSuccess = fetcher.data?.ok === true;
	const error = fetcher.data?.error;

	useEffect(() => {
		if (isSuccess) setEmail("");
	}, [isSuccess]);

	return (
		<fetcher.Form
			method="post"
			action="/api/subscribe"
			className="flex flex-wrap gap-2"
		>
			<input
				type="email"
				name="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder="you@example.com"
				required
				disabled={isSubmitting}
				className="font-mono text-sm px-3 py-2 rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] text-[var(--terminal-text)] placeholder:text-[var(--terminal-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--terminal-accent)] disabled:opacity-50 min-w-[200px]"
				aria-label="Email for newsletter"
			/>
			<button
				type="submit"
				disabled={isSubmitting}
				className="font-mono text-sm px-4 py-2 rounded bg-[var(--terminal-accent)] text-[var(--terminal-bg)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--terminal-accent)] focus:ring-offset-2 focus:ring-offset-[var(--terminal-bg)] disabled:opacity-50"
			>
				{isSubmitting ? "..." : "Subscribe"}
			</button>
			{isSuccess && (
				<span className="font-mono text-sm text-[var(--terminal-green)] self-center">
					✓ Subscribed.
				</span>
			)}
			{error && (
				<span className="font-mono text-sm text-red-400 self-center">
					{error}
				</span>
			)}
		</fetcher.Form>
	);
}
