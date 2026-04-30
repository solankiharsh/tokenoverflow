import { SignUp } from "@clerk/react-router";
import type { Route } from "./+types/sign-up";
import { terminalAppearance } from "~/lib/clerk-appearance";
import { buildMeta } from "~/lib/seo";

export function meta({ location }: Route.MetaArgs) {
	return buildMeta({
		title: "Sign up",
		description: "Create an account.",
		path: location.pathname,
		noindex: true,
	});
}

export default function SignUpPage() {
	return (
		<div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md border border-volt-border bg-volt-carbon p-4 shadow-[0_0_15px_rgba(92,88,85,0.2)]">
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
