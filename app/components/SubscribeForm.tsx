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
			className="flex flex-wrap gap-2 items-center"
		>
			<input
				type="email"
				name="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder="you@example.com"
				required
				disabled={isSubmitting}
				className="font-mono text-sm px-4 py-2.5 border-[3px] border-comic-black bg-comic-white text-comic-black placeholder-comic-gray-light focus:outline-none focus:ring-2 focus:ring-comic-yellow min-w-[200px] disabled:opacity-50"
				aria-label="Email for newsletter"
			/>
			<button
				type="submit"
				disabled={isSubmitting}
				className="comic-btn text-sm py-2.5 px-5 disabled:opacity-50"
			>
				{isSubmitting ? "..." : "SUBSCRIBE"}
			</button>
			{isSuccess && (
				<span className="font-display font-bold text-sm text-comic-gray-dark self-center">
					✓ Subscribed.
				</span>
			)}
			{error && (
				<span className="font-mono text-sm text-red-600 self-center">
					{error}
				</span>
			)}
		</fetcher.Form>
	);
}
