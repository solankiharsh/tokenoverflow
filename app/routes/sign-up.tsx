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
			<div className="w-full max-w-md border-[3px] border-comic-black bg-comic-white p-4 shadow-[4px_4px_0_0_#000]">
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
