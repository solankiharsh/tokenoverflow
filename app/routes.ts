import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("about", "routes/about.tsx"),
	route("projects", "routes/projects.tsx"),
	route("blog", "routes/blog.tsx"),
	route("blog/:slug", "routes/blog.$slug.tsx"),
	route("cloak", "routes/cloak.tsx"),
	// Hidden personal reference — intentionally not linked from the main nav.
	route("wiki", "routes/wiki.tsx"),
	// SEO resource routes
	route("robots.txt", "routes/robots.ts"),
	route("sitemap.xml", "routes/sitemap.ts"),
	route("api/subscribe", "routes/api.subscribe.tsx"),
	route("admin", "routes/admin.tsx"),
	route("admin/posts/new", "routes/admin.posts.new.tsx"),
	route("admin/posts/:id/edit", "routes/admin.posts.$id.edit.tsx"),
	route("api/admin/posts", "routes/api.admin.posts.tsx"),
	route("api/admin/posts/:id", "routes/api.admin.posts.$id.tsx"),
	route("sign-in/*", "routes/sign-in.tsx"),
	route("sign-up/*", "routes/sign-up.tsx"),

	// CRM — public
	route("api/crm/submit", "routes/api.crm.submit.tsx"),

	// CRM — admin UI
	route("admin/crm", "routes/admin.crm.tsx"),
	route("admin/crm/contacts/:id", "routes/admin.crm.contacts.$id.tsx"),
	route("admin/crm/pipeline", "routes/admin.crm.pipeline.tsx"),

	// CRM — admin API
	route("api/admin/crm/contacts", "routes/api.admin.crm.contacts.tsx"),
	route("api/admin/crm/contacts/:id", "routes/api.admin.crm.contacts.$id.tsx"),
	route("api/admin/crm/deals", "routes/api.admin.crm.deals.tsx"),
	route(
		"api/admin/crm/deals/:id/stage",
		"routes/api.admin.crm.deals.$id.stage.tsx",
	),
	route("api/admin/crm/activities", "routes/api.admin.crm.activities.tsx"),
	route("api/admin/crm/stats", "routes/api.admin.crm.stats.tsx"),
	route("api/admin/crm/submissions", "routes/api.admin.crm.submissions.tsx"),
] satisfies RouteConfig;
