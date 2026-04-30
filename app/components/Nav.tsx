import { Link } from "react-router";

const navItems = [
	{ to: "/", label: "Home" },
	{ to: "/about", label: "About" },
	{ to: "/projects", label: "Projects" },
	{ to: "/cloak", label: "Cloak" },
	{ to: "/blog", label: "Blog" },
	{ to: "#subscribe", label: "Subscribe" },
];

export function Nav() {
	return (
		<nav
			className="sticky top-0 z-50 border-b border-volt-border bg-volt-abyss/95 backdrop-blur-md"
			aria-label="Main"
		>
			<div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
				<Link
					to="/"
					className="font-medium text-[0.94rem] text-volt-snow hover:text-volt-green transition-colors tracking-tight"
				>
					harsh<span className="text-volt-green">@</span>tokenoverflow
				</Link>
				<ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
					{navItems.map(({ to, label }) => (
						<li key={to}>
							{to.startsWith("#") ? (
								<a
									href={to}
									className="text-[0.94rem] font-medium text-volt-snow hover:text-volt-mint transition-colors"
								>
									{label}
								</a>
							) : (
								<Link
									to={to}
									className="text-[0.94rem] font-medium text-volt-snow hover:text-volt-mint transition-colors"
								>
									{label}
								</Link>
							)}
						</li>
					))}
				</ul>
			</div>
		</nav>
	);
}
