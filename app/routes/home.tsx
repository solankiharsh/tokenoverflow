import type { Route } from "./+types/home";
import { loadContextKey } from "../lib/load-context";
import { getRecentPosts } from "../data/blog";
import { LandingHero } from "../components/landing/LandingHero";
import { LandingServices } from "../components/landing/LandingServices";
import { LandingCaseStudies } from "../components/landing/LandingCaseStudies";
import { LandingSocialProof } from "../components/landing/LandingSocialProof";
import { LandingBlogTeaser } from "../components/landing/LandingBlogTeaser";
import { LandingCta } from "../components/landing/LandingCta";
import { buildMeta } from "../lib/seo";

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

export function meta({ location }: Route.MetaArgs) {
	return buildMeta({
		fullTitle: "Harsh Solanki — Production AI systems that ship",
		description:
			"Engineering Lead, Applied AI at Deriv (Dubai). I architect production AI systems that ship — multi-agent pipelines, algorithmic trading engines, MLOps platforms, and the writing in between.",
		path: location.pathname,
		keywords: [
			"Harsh Solanki",
			"Applied AI",
			"AI engineering",
			"MLOps",
			"multi-agent systems",
			"Deriv",
			"Dubai AI engineer",
			"production AI",
		],
	});
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
