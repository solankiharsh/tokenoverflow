import type { Route } from "./+types/home";
import { loadContextKey } from "../lib/load-context";
import { getRecentPosts } from "../data/blog";
import { LandingHero } from "../components/landing/LandingHero";
import { LandingServices } from "../components/landing/LandingServices";
import { LandingCaseStudies } from "../components/landing/LandingCaseStudies";
import { LandingSocialProof } from "../components/landing/LandingSocialProof";
import { LandingBlogTeaser } from "../components/landing/LandingBlogTeaser";
import { LandingCta } from "../components/landing/LandingCta";

export async function loader(args: Route.LoaderArgs) {
	const env = args.context.get(loadContextKey).cloudflare.env as {
		DB?: Parameters<typeof getRecentPosts>[0];
	};
	if (!env?.DB) {
		return { recentPosts: [] };
	}
	try {
		const recentPosts = await getRecentPosts(env.DB, 3);
		return { recentPosts };
	} catch {
		return { recentPosts: [] };
	}
}

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Harsh Solanki | Production AI systems that ship" },
		{
			name: "description",
			content:
				"I architect production AI systems that ship — multi-agent pipelines, trading engines, and platform work. Dubai. Deriv.",
		},
	];
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const { recentPosts } = loaderData;

	return (
		<div className="bg-volt-abyss text-volt-snow">
			<LandingHero />
			<LandingServices />
			<LandingCaseStudies />
			<LandingSocialProof />
			<LandingBlogTeaser posts={recentPosts} />
			<LandingCta />
		</div>
	);
}
