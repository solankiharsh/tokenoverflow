import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("about", "routes/about.tsx"),
	route("projects", "routes/projects.tsx"),
	route("blog", "routes/blog.tsx"),
	route("blog/:slug", "routes/blog.$slug.tsx"),
	route("cloak", "routes/cloak.tsx"),
	route("api/subscribe", "routes/api.subscribe.tsx"),
	route("admin", "routes/admin.tsx"),
	route("admin/posts/new", "routes/admin.posts.new.tsx"),
	route("admin/posts/:id/edit", "routes/admin.posts.$id.edit.tsx"),
	route("api/admin/posts", "routes/api.admin.posts.tsx"),
	route("api/admin/posts/:id", "routes/api.admin.posts.$id.tsx"),
	route("sign-in/*", "routes/sign-in.tsx"),
	route("sign-up/*", "routes/sign-up.tsx"),
] satisfies RouteConfig;
