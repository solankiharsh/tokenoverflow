import { Link, useLocation } from "react-router";
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
	const location = useLocation();
	const isLanding = location.pathname === "/";
	const isAdmin =
		(user?.publicMetadata as { role?: string } | undefined)?.role === "admin";

	const navClass = isLanding
		? "font-heading text-sm sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md"
		: "font-display text-sm border-b-[3px] border-comic-black bg-comic-white";
	const navStyle = isLanding ? undefined : { boxShadow: "0 2px 0 0 #000" };
	const linkClass = isLanding
		? "font-semibold uppercase tracking-wide text-zinc-400 hover:text-white transition text-xs sm:text-sm"
		: "font-display font-bold uppercase text-comic-black hover:text-comic-yellow transition";
	const brandClass = isLanding
		? "font-heading font-bold text-base sm:text-lg tracking-tight text-white hover:text-cyan-300 transition"
		: "font-display font-bold text-lg uppercase tracking-tight text-comic-black hover:text-comic-yellow transition";
	const adminClass = isLanding
		? "font-semibold uppercase tracking-wide text-violet-400 hover:text-violet-200 transition text-xs sm:text-sm"
		: "font-display font-bold uppercase text-comic-gray-medium hover:text-comic-yellow transition";

	return (
		<nav className={navClass} style={navStyle} aria-label="Main">
			<div
				className={
					isLanding
						? "max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2"
						: "max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2"
				}
			>
				<Link to="/" className={brandClass}>
					{isLanding ? (
						<>
							harsh<span className="text-cyan-400">@</span>tokenoverflow
						</>
					) : (
						<>
							harsh@<span className="text-comic-yellow">tokenoverflow</span>
						</>
					)}
				</Link>
				<ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
					{navItems.map(({ to, label }) => (
						<li key={to}>
							{to.startsWith("#") ? (
								<a href={to} className={linkClass}>
									{label}
								</a>
							) : (
								<Link to={to} className={linkClass}>
									{label}
								</Link>
							)}
						</li>
					))}
					{isAdmin && (
						<>
							<li>
								<Link to="/admin" className={adminClass}>
									ADMIN
								</Link>
							</li>
							<li>
								<Link to="/admin/crm" className={adminClass}>
									CRM
								</Link>
							</li>
						</>
					)}
					<li className="ml-auto flex items-center gap-2">
						<SignedOut>
							<SignInButton mode="modal">
								<button
									type="button"
									className={
										isLanding
											? "rounded-lg border border-white/15 bg-white/5 text-white text-xs py-1.5 px-3 font-semibold uppercase hover:bg-white/10 transition"
											: "comic-btn-outline text-xs py-1.5 px-3"
									}
								>
									SIGN IN
								</button>
							</SignInButton>
							<SignUpButton mode="modal">
								<button
									type="button"
									className={
										isLanding
											? "rounded-lg bg-white text-zinc-950 text-xs py-1.5 px-3 font-semibold uppercase hover:bg-zinc-200 transition"
											: "comic-btn text-xs py-1.5 px-3"
									}
								>
									SIGN UP
								</button>
							</SignUpButton>
						</SignedOut>
						<SignedIn>
							<UserButton
								afterSignOutUrl="/"
								appearance={{
									elements: {
										avatarBox: isLanding
											? "w-8 h-8 border-2 border-white/20"
											: "w-8 h-8 border-[3px] border-comic-black",
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
