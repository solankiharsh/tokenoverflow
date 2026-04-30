import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("about", "routes/about.tsx"),
	route("projects", "routes/projects.tsx"),
	route("blog", "routes/blog.tsx"),
	route("blog/:slug", "routes/blog.$slug.tsx"),
	// Hidden personal reference — intentionally not linked from the main nav.
	route("wiki", "routes/wiki.tsx"),
	// SEO resource routes
	route("robots.txt", "routes/robots.ts"),
	route("sitemap.xml", "routes/sitemap.ts"),
	route("api/subscribe", "routes/api.subscribe.tsx"),

	// CRM — public lead capture only
	route("api/crm/submit", "routes/api.crm.submit.tsx"),
] satisfies RouteConfig;
