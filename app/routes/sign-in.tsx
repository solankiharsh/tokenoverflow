import { SignIn } from "@clerk/react-router";
import type { Route } from "./+types/sign-in";
import { terminalAppearance } from "~/lib/clerk-appearance";
import { buildMeta } from "~/lib/seo";

export function meta({ location }: Route.MetaArgs) {
	return buildMeta({
		title: "Sign in",
		description: "Sign in to your account.",
		path: location.pathname,
		noindex: true,
	});
}

export default function SignInPage() {
	return (
		<div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md border border-volt-border bg-volt-carbon p-4 shadow-[0_0_15px_rgba(92,88,85,0.2)]">
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
