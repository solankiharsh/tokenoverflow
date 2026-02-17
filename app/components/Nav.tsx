import { Link } from "react-router";
import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
	UserButton,
	useUser,
} from "@clerk/react-router";

const navItems = [
	{ to: "/", label: "HOME" },
	{ to: "/about", label: "ABOUT" },
	{ to: "/projects", label: "PROJECTS" },
	{ to: "/cloak", label: "CLOAK" },
	{ to: "/blog", label: "BLOG" },
	{ to: "#subscribe", label: "SUBSCRIBE" },
];

export function Nav() {
	const { user } = useUser();
	const isAdmin =
		(user?.publicMetadata as { role?: string } | undefined)?.role === "admin";

	return (
		<nav
			className="font-display text-sm border-b-[3px] border-comic-black bg-comic-white"
			style={{ boxShadow: "0 2px 0 0 #000" }}
			aria-label="Main"
		>
			<div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
				<Link
					to="/"
					className="font-display font-bold text-lg uppercase tracking-tight text-comic-black hover:text-comic-yellow transition"
				>
					harsh@<span className="text-comic-yellow">tokenoverflow</span>
				</Link>
				<ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
					{navItems.map(({ to, label }) => (
						<li key={to}>
							{to.startsWith("#") ? (
								<a
									href={to}
									className="font-display font-bold uppercase text-comic-black hover:text-comic-yellow transition"
								>
									{label}
								</a>
							) : (
								<Link
									to={to}
									className="font-display font-bold uppercase text-comic-black hover:text-comic-yellow transition"
								>
									{label}
								</Link>
							)}
						</li>
					))}
					{isAdmin && (
						<li>
							<Link
								to="/admin"
								className="font-display font-bold uppercase text-comic-gray-medium hover:text-comic-yellow transition"
							>
								ADMIN
							</Link>
						</li>
					)}
					<li className="ml-auto flex items-center gap-2">
						<SignedOut>
							<SignInButton mode="modal">
								<button
									type="button"
									className="comic-btn-outline text-xs py-1.5 px-3"
								>
									SIGN IN
								</button>
							</SignInButton>
							<SignUpButton mode="modal">
								<button type="button" className="comic-btn text-xs py-1.5 px-3">
									SIGN UP
								</button>
							</SignUpButton>
						</SignedOut>
						<SignedIn>
							<UserButton
								afterSignOutUrl="/"
								appearance={{
									elements: {
										avatarBox:
											"w-8 h-8 border-[3px] border-comic-black",
									},
								}}
							/>
						</SignedIn>
					</li>
				</ul>
			</div>
		</nav>
	);
}
