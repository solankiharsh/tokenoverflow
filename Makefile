# tokenoverflow — portfolio (React Router + Cloudflare Workers)
# Usage: make [target]

.PHONY: install dev build deploy preview typecheck clean kill-ports db-create db-migrate db-migrate-local db-seed db-seed-local db-setup-local update-d1-uuid help

# Default dev server port (react-router dev)
PORT ?= 5173

help:
	@echo "tokenoverflow — Harsh Solanki portfolio"
	@echo ""
	@echo "  make install   Install dependencies"
	@echo "  make dev       Run dev server (default port $(PORT))"
	@echo "  make build     Production build"
	@echo "  make deploy    Deploy to Cloudflare Workers"
	@echo "  make preview  Build + preview production locally"
	@echo "  make typecheck Run TypeScript + React Router typegen"
	@echo "  make clean     Remove build output and node_modules"
	@echo "  make kill-ports Kill processes on $(PORT) (if dev server won't start)"
	@echo "  make db-create        Create D1 database (requires CLOUDFLARE_API_TOKEN)"
	@echo "  make db-migrate       Apply migrations to D1 (remote)"
	@echo "  make db-migrate-local Apply migrations to D1 (local dev — run once before npm run dev)"
	@echo "  make db-seed          Seed posts (remote)"
	@echo "  make db-seed-local    Seed posts (local dev; run db-migrate-local first)"
	@echo "  make db-setup-local   Create table + seed local D1 (migrate then seed)"
	@echo "  make update-d1-uuid   Fetch D1 UUID via API (uses .env.local) and update wrangler.json"
	@echo ""

install:
	npm install

dev:
	npm run dev

build:
	npm run build

deploy: build
	npm run deploy

preview: build
	npm run preview

typecheck:
	npm run cf-typegen
	npm run typecheck

clean:
	rm -rf build node_modules .react-router

kill-ports:
	@lsof -ti:$(PORT) | xargs kill -9 2>/dev/null || true
	@echo "Killed processes on port $(PORT) (if any)."

DB_NAME ?= tokenoverflow-blog

db-create:
	npx wrangler d1 create $(DB_NAME)

db-migrate:
	npx wrangler d1 execute $(DB_NAME) --remote --file=./migrations/0001_create_posts.sql

db-migrate-local:
	npx wrangler d1 execute $(DB_NAME) --local --file=./migrations/0001_create_posts.sql

db-seed:
	npx wrangler d1 execute $(DB_NAME) --remote --file=./migrations/0002_seed_posts.sql

db-seed-local:
	npx wrangler d1 execute $(DB_NAME) --local --file=./migrations/0002_seed_posts.sql

# First-time local setup: create posts table then seed (run once before npm run dev)
db-setup-local:
	$(MAKE) db-migrate-local
	$(MAKE) db-seed-local

# First-time remote setup: apply schema + seed to production D1 (requires CLOUDFLARE_API_TOKEN)
db-setup-remote: db-migrate db-seed

# Fetch D1 database UUID via Cloudflare API and set d1_databases[0].database_id in wrangler.json.
# Reads CLOUDFLARE_API_TOKEN (and optional CLOUDFLARE_ACCOUNT_ID) from .env.local.
# Run once after creating the D1 DB, then run db-setup-remote.
update-d1-uuid:
	node scripts/update-d1-uuid.mjs
