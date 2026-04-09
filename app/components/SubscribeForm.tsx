import { useFetcher } from "react-router";
import { useEffect, useState } from "react";

export function SubscribeForm({ variant = "comic" }: { variant?: "comic" | "dark" }) {
	const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
	const [email, setEmail] = useState("");
	const isSubmitting = fetcher.state !== "idle";
	const isSuccess = fetcher.data?.ok === true;
	const error = fetcher.data?.error;

	useEffect(() => {
		if (isSuccess) setEmail("");
	}, [isSuccess]);

	const inputClass =
		variant === "dark"
			? "font-mono text-sm px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 min-w-[200px] disabled:opacity-50"
			: "font-mono text-sm px-4 py-2.5 border-[3px] border-comic-black bg-comic-white text-comic-black placeholder-comic-gray-light focus:outline-none focus:ring-2 focus:ring-comic-yellow min-w-[200px] disabled:opacity-50";
	const buttonClass =
		variant === "dark"
			? "rounded-xl bg-white text-zinc-950 font-heading font-semibold text-sm py-2.5 px-5 hover:bg-zinc-200 transition disabled:opacity-50"
			: "comic-btn text-sm py-2.5 px-5 disabled:opacity-50";
	const successClass =
		variant === "dark"
			? "font-heading font-semibold text-sm text-cyan-400 self-center"
			: "font-display font-bold text-sm text-comic-gray-dark self-center";

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
				className={inputClass}
				aria-label="Email for newsletter"
			/>
			<button type="submit" disabled={isSubmitting} className={buttonClass}>
				{isSubmitting ? "..." : "SUBSCRIBE"}
			</button>
			{isSuccess && (
				<span className={successClass}>✓ Subscribed.</span>
			)}
			{error && (
				<span className="font-mono text-sm text-red-400 self-center">
					{error}
				</span>
			)}
		</fetcher.Form>
	);
}
