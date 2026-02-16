import { SignIn } from "@clerk/react-router";
import type { Route } from "./+types/sign-in";
import { terminalAppearance } from "~/lib/clerk-appearance";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Sign in | Harsh Solanki" },
		{ name: "description", content: "Sign in to your account." },
	];
}

export default function SignInPage() {
	return (
		<div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] p-4 shadow-lg">
				<SignIn
					appearance={terminalAppearance}
					routing="path"
					path="/sign-in"
					signUpUrl="/sign-up"
					afterSignInUrl="/"
				/>
			</div>
		</div>
	);
}
