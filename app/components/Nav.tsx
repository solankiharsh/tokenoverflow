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
	{ to: "/", label: "~/$ home" },
	{ to: "/about", label: "~/$ about" },
	{ to: "/projects", label: "~/$ projects" },
	{ to: "/blog", label: "~/$ blog" },
	{ to: "#subscribe", label: "~/$ subscribe" },
];

export function Nav() {
	const { user } = useUser();
	const isAdmin =
		(user?.publicMetadata as { role?: string } | undefined)?.role === "admin";

	return (
		<nav
			className="font-mono text-sm border-b border-[var(--terminal-border)] bg-[var(--terminal-bg)]"
			aria-label="Main"
		>
			<div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
				<Link
					to="/"
					className="text-[var(--terminal-accent)] hover:underline focus:outline-none focus:underline"
				>
					harsh@tokenoverflow
				</Link>
				<ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
					{navItems.map(({ to, label }) => (
						<li key={to}>
							{to.startsWith("#") ? (
								<a
									href={to}
									className="text-[var(--terminal-text)] hover:text-[var(--terminal-accent)] hover:underline focus:outline-none focus:underline"
								>
									{label}
								</a>
							) : (
								<Link
									to={to}
									className="text-[var(--terminal-text)] hover:text-[var(--terminal-accent)] hover:underline focus:outline-none focus:underline"
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
								className="text-[var(--terminal-green)] hover:text-[var(--terminal-accent)] hover:underline focus:outline-none focus:underline"
							>
								~/$ admin
							</Link>
						</li>
					)}
					<li className="ml-auto flex items-center gap-4">
						<SignedOut>
							<SignInButton mode="modal">
								<button
									type="button"
									className="font-mono text-[var(--terminal-accent)] hover:underline focus:outline-none focus:underline"
								>
									~/$ sign-in
								</button>
							</SignInButton>
							<SignUpButton mode="modal">
								<button
									type="button"
									className="font-mono text-[var(--terminal-text)] hover:text-[var(--terminal-accent)] hover:underline focus:outline-none focus:underline"
								>
									~/$ sign-up
								</button>
							</SignUpButton>
						</SignedOut>
						<SignedIn>
							<UserButton
								afterSignOutUrl="/"
								appearance={{
									elements: {
										avatarBox: "w-8 h-8 border border-[var(--terminal-border)]",
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
