import { SubscribeForm } from "./SubscribeForm";

const socials = [
	{ href: "https://www.linkedin.com/in/solankiharsh/", label: "LinkedIn" },
	{ href: "https://own.page/solharsh", label: "Own.page" },
	{ href: "https://github.com/solankiharsh", label: "GitHub" },
	{ href: "https://www.facebook.com/herschevardhan", label: "Facebook" },
	{ href: "https://x.com/HarshSolan24317", label: "X" },
	{ href: "https://www.instagram.com/urbansanyaasii/", label: "Instagram" },
	{ href: "https://medium.com/@solharsh", label: "Medium" },
	{ href: "https://substack.com/@solankiharsh", label: "Substack" },
];

export function Footer() {
	return (
		<footer className="border-t border-volt-border bg-volt-abyss text-volt-fog mt-auto">
			<div className="max-w-6xl mx-auto px-4 py-12">
				<section id="subscribe" className="mb-10">
					<h2 className="comic-heading text-lg text-volt-snow mb-2">Subscribe</h2>
					<p className="text-volt-steel text-sm mb-3 font-mono">
						Occasional AI/ML notes — no spam.
					</p>
					<div className="max-w-md">
						<SubscribeForm />
					</div>
				</section>
				<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
					{socials.map(({ href, label }) => (
						<a
							key={href}
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className="font-medium text-volt-fog hover:text-white transition-colors"
						>
							{label}
						</a>
					))}
				</div>
				<p className="mt-6 text-xs text-volt-steel font-mono">
					React Router · Cloudflare Workers · D1
				</p>
			</div>
		</footer>
	);
}
