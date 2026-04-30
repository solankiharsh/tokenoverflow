import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("about", "routes/about.tsx"),
	route("projects", "routes/projects.tsx"),
	route("blog", "routes/blog.tsx"),
	route("blog/:slug", "routes/blog.$slug.tsx"),
	route("wiki", "routes/wiki.tsx"),
	route("robots.txt", "routes/robots.ts"),
	route("sitemap.xml", "routes/sitemap.ts"),
	route("voight-kampff", "routes/voight-kampff.tsx"),
	route("ascii", "routes/ascii-redirect.tsx"),
	route("vk", "routes/ascii-redirect.tsx", { id: "vk-alias" }),
	route("api/vk/analyze", "routes/api.vk.analyze.tsx"),
	route("api/subscribe", "routes/api.subscribe.tsx"),

	// CRM — public lead capture only
	route("api/crm/submit", "routes/api.crm.submit.tsx"),
] satisfies RouteConfig;
