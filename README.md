# Welcome to React Router + Cloudflare Workers!

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/react-router-starter-template)

![React Router Starter Template Preview](https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/bfdc2f85-e5c9-4c92-128b-3a6711249800/public)

<!-- dash-content-start -->

A modern, production-ready template for building full-stack React applications using [React Router](https://reactrouter.com/) and the [Cloudflare Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/).

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)
- 🔎 Built-in Observability to monitor your Worker
<!-- dash-content-end -->

## Getting Started

Outside of this repo, you can start a new project with this template using [C3](https://developers.cloudflare.com/pages/get-started/c3/) (the `create-cloudflare` CLI):

```bash
npm create cloudflare@latest -- --template=cloudflare/templates/react-router-starter-template
```

A live public deployment of this template is available at [https://react-router-starter-template.templates.workers.dev](https://react-router-starter-template.templates.workers.dev)

### Installation

Install the dependencies:

```bash
npm install
# or
make install
```

### Development

Start the development server with HMR:

```bash
npm run dev
# or
make dev
```

Your application will be available at `http://localhost:5173`.

**Makefile shortcuts:** `make help` lists all targets. Use `make install`, `make dev`, `make build`, `make deploy`, `make preview`, `make typecheck`, `make clean`, or `make kill-ports` (if the dev server port is stuck).

## Before first deploy (you do this, not the PR)

**Merging a PR only deploys code.** It does not create Cloudflare resources or run migrations. To have a working production site (blog, subscribe, sign-in), do the following **once** before or right after your first deploy:

| What | Where / How |
|------|-------------|
| **D1 (blog)** | Run `make db-create`, put `database_id` in `wrangler.json`, then `make db-migrate` and optionally `make db-seed`. |
| **KV (subscribe)** | Run `npx wrangler kv namespace create SUBSCRIBERS`, put the returned `id` in `wrangler.json`. |
| **Clerk (auth)** | In Cloudflare Workers dashboard → your Worker → **Settings** → **Variables and Secrets**: add secret `CLERK_SECRET_KEY` and variables `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_PUBLISHABLE_KEY`. |

**Where to run the D1 and KV commands:** In your **local terminal**, from the project root (the `tokenoverflow/` directory). Log in to Cloudflare first: `npx wrangler login` (or set `CLOUDFLARE_API_TOKEN`). Then run the commands; paste the returned IDs into `wrangler.json` in this repo. Clerk is configured in the **Cloudflare dashboard** only (no terminal commands).

Details for each are below.

---

## Authentication (Clerk)

Sign-in and admin blog CMS use [Clerk](https://clerk.com) with social login (Google, GitHub, etc.).

1. Create an application at [dashboard.clerk.com](https://dashboard.clerk.com).
2. Copy `.dev.vars.example` to `.dev.vars` and set `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
3. For production: in Cloudflare Workers dashboard, add **Secrets** `CLERK_SECRET_KEY` and set **Variables** `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_PUBLISHABLE_KEY` (same value as publishable key).
4. To enable the **Admin** link and `/admin` blog CMS: in Clerk dashboard, open your user → **Public metadata** → add `{ "role": "admin" }`.

## Blog CMS and D1

Blog posts are stored in Cloudflare D1 (SQLite). The admin dashboard at `/admin` (admin users only) lets you create, edit, and delete posts without deploying.

1. Create a D1 database (if needed): `make db-create` or create in the Cloudflare dashboard. Your API token must have **D1 Edit** for `make db-create`.
2. Put **`CLOUDFLARE_API_TOKEN`** in `.env.local` (and optionally **`CLOUDFLARE_ACCOUNT_ID`** if you have multiple accounts). Then run **`make update-d1-uuid`**: it uses the Cloudflare API to list D1 databases, finds the one named in `wrangler.json` (e.g. `tokenoverflow-blog`), and sets `d1_databases[0].database_id` to that database’s UUID. No need to copy the UUID by hand.
3. Apply schema and seed to the **remote** D1 (required once so the blog works in production). With the token in the environment (e.g. from `.env.local`), run:
   ```bash
   set -a && source .env.local && set +a && make db-setup-remote
   ```
   Or `export CLOUDFLARE_API_TOKEN=your_token_here && make db-setup-remote`. You can run `make db-migrate` then `make db-seed` separately; both use the DB in `wrangler.json`.
4. Run `npm run cf-typegen` after any `wrangler.json` change.

**Verify deployment (Workers & Pages):** In the Cloudflare dashboard, open your Worker → **Bindings**. Confirm a **D1** binding named **DB** is attached and points to **tokenoverflow-blog** (or the same `database_id` as in `wrangler.json`). If the binding is missing, the app can 500 when loading `/` or `/blog`. Also ensure **Variables** `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_PUBLISHABLE_KEY` are set to your Clerk publishable key (not empty); empty values in logs will break Clerk and can cause 500s.

For **local dev**, `npm run dev` uses a local D1 database. First-time setup: run `make db-setup-local` (creates the `posts` table and seeds sample posts). If you only need the table, run `make db-migrate-local`; run `make db-seed-local` only after the table exists.

## Newsletter (Subscribe)

The subscribe form stores emails in Cloudflare KV. The project’s `wrangler.json` is already configured with a SUBSCRIBERS KV namespace ID. If you need to create a new one: `npx wrangler kv namespace create SUBSCRIBERS`, then put the returned `id` into `wrangler.json` under `kv_namespaces[0].id`. Run `npm run cf-typegen` after any change.

## Debugging "Unexpected Server Error"

If your Workers deployment shows a blank **Unexpected Server Error** page:

1. **See the actual error in the browser**
   Open the same URL with `?debug=1` (e.g. `https://your-worker.workers.dev/?debug=1`). The response body will show the error message and stack trace. Remove `?debug=1` when done; don’t rely on it in production.

2. **Check Cloudflare Real-time Logs**
   In the [Cloudflare dashboard](https://dash.cloudflare.com) → **Workers & Pages** → your Worker → **Logs** (or **Real-time Logs**). Errors are logged there; look for `[tokenoverflow] Server error:` or `[tokenoverflow] Unexpected server error:`.

3. **Confirm bindings and env**
   In the Worker’s **Settings** → **Variables and Secrets**: set **Variables** `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_PUBLISHABLE_KEY` to your Clerk publishable key (not empty). Add secret **CLERK_SECRET_KEY**. Under **Settings** → **Bindings**, ensure the **D1** binding **DB** is attached to your `tokenoverflow-blog` database.

4. **Run D1 migrations on production**
   If the error mentions D1 or “no such table”, apply migrations to the remote DB:
   `set -a && source .env.local && set +a && make db-setup-remote`
   (or `make db-migrate` with the same env so it targets the DB in `wrangler.json`).

5. **Reproduce locally**
   Run `npm run dev` and open `http://localhost:5173`. If it works locally but fails on Workers, the issue is usually a missing binding, empty Clerk keys, or migrations not applied to the deployed D1.

## Typegen

Generate types for your Cloudflare bindings in `wrangler.json`:

```sh
npm run typegen
```

## Building for Production

Create a production build:

```bash
npm run build
```

## Previewing the Production Build

Preview the production build locally:

```bash
npm run preview
```

## Deployment

If you don't have a Cloudflare account, [create one here](https://dash.cloudflare.com/sign-up)! Go to your [Workers dashboard](https://dash.cloudflare.com/?to=%2F%3Aaccount%2Fworkers-and-pages) to see your [free custom Cloudflare Workers subdomain](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/) on `*.workers.dev`.

Once that's done, you can build your app:

```sh
npm run build
```

And deploy it:

```sh
npm run deploy
```

To deploy a preview URL:

```sh
npx wrangler versions upload
```

You can then promote a version to production after verification or roll it out progressively.

```sh
npx wrangler versions deploy
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
