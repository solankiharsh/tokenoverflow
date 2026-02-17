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
		<footer className="border-t-[3px] border-comic-black bg-comic-white mt-auto">
			<div className="max-w-4xl mx-auto px-4 py-8">
				<section id="subscribe" className="mb-8">
					<h2 className="comic-heading text-lg mb-2">
						<span className="yellow-highlight">SUBSCRIBE</span>
					</h2>
					<p className="text-comic-gray-medium text-sm mb-3 font-mono">
						$ echo &quot;your@email.com&quot; &gt;&gt; subscribers.txt
					</p>
					<p className="text-comic-gray-dark text-sm mb-3">
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
							className="font-display font-bold uppercase text-comic-black hover:text-comic-yellow transition"
						>
							{label}
						</a>
					))}
				</div>
				<p className="mt-4 text-xs text-comic-gray-medium font-mono">
					Built with React Router + Cloudflare. No servers were harmed.
				</p>
			</div>
		</footer>
	);
}
