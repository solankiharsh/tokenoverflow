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
	{ to: "/", label: "Home" },
	{ to: "/about", label: "About" },
	{ to: "/projects", label: "Projects" },
	{ to: "/cloak", label: "Cloak" },
	{ to: "/voight-kampff", label: "V-K" },
	{ to: "/blog", label: "Blog" },
	{ to: "#subscribe", label: "Subscribe" },
];

export function Nav() {
	const { user } = useUser();
	const isAdmin =
		(user?.publicMetadata as { role?: string } | undefined)?.role === "admin";

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
					{isAdmin && (
						<>
							<li>
								<Link
									to="/admin"
									className="text-[0.94rem] font-medium text-volt-purple hover:text-volt-mist transition-colors"
								>
									Admin
								</Link>
							</li>
							<li>
								<Link
									to="/admin/crm"
									className="text-[0.94rem] font-medium text-volt-purple hover:text-volt-mist transition-colors"
								>
									CRM
								</Link>
							</li>
						</>
					)}
					<li className="ml-auto flex items-center gap-2">
						<SignedOut>
							<SignInButton mode="modal">
								<button type="button" className="comic-btn-outline text-xs py-2 px-3">
									Sign in
								</button>
							</SignInButton>
							<SignUpButton mode="modal">
								<button type="button" className="comic-btn text-xs py-2 px-3">
									Sign up
								</button>
							</SignUpButton>
						</SignedOut>
						<SignedIn>
							<UserButton
								afterSignOutUrl="/"
								appearance={{
									elements: {
										avatarBox: "w-8 h-8 border border-volt-border rounded-md",
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
