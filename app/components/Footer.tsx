import { SubscribeForm } from "./SubscribeForm";

const socials = [
	{ href: "https://www.linkedin.com/in/solankiharsh/", label: "LinkedIn" },
	{ href: "https://github.com/solankiharsh", label: "GitHub" },
	{ href: "https://www.facebook.com/herschevardhan", label: "Facebook" },
	{ href: "https://x.com/HarshSolan24317", label: "X" },
	{ href: "https://www.instagram.com/urbansanyaasii/", label: "Instagram" },
	{ href: "https://medium.com/@solharsh", label: "Medium" },
	{ href: "https://substack.com/@solankiharsh", label: "Substack" },
];

export function Footer() {
	return (
		<footer className="border-t border-[var(--terminal-border)] bg-[var(--terminal-bg)] mt-auto">
			<div className="max-w-4xl mx-auto px-4 py-8">
				<section id="subscribe" className="mb-8">
					<h2 className="font-mono text-sm text-[var(--terminal-accent)] mb-2">
						$ echo &quot;your@email.com&quot; &gt;&gt; subscribers.txt
					</h2>
					<p className="text-[var(--terminal-text-muted)] text-sm mb-3">
						No spam. Occasional AI/ML nuggets. Unsubscribe anytime.
					</p>
					<SubscribeForm />
				</section>
				<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
					{socials.map(({ href, label }) => (
						<a
							key={href}
							href={href}
							target="_blank"
							rel="noreferrer"
							className="font-mono text-[var(--terminal-accent)] hover:underline"
						>
							{label}
						</a>
					))}
				</div>
				<p className="mt-4 text-xs text-[var(--terminal-text-muted)] font-mono">
					Built with React Router + Cloudflare. No servers were harmed.
				</p>
			</div>
		</footer>
	);
}
