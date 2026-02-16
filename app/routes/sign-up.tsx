import { SignUp } from "@clerk/react-router";
import type { Route } from "./+types/sign-up";
import { terminalAppearance } from "~/lib/clerk-appearance";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Sign up | Harsh Solanki" },
		{ name: "description", content: "Create an account." },
	];
}

export default function SignUpPage() {
	return (
		<div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] p-4 shadow-lg">
				<SignUp
					appearance={terminalAppearance}
					routing="path"
					path="/sign-up"
					signInUrl="/sign-in"
					afterSignUpUrl="/"
				/>
			</div>
		</div>
	);
}
