#!/usr/bin/env node
/**
 * Fetches the D1 database UUID via Cloudflare API (using CLOUDFLARE_API_TOKEN
 * from .env.local) and updates wrangler.json d1_databases[0].database_id.
 * Optional: set CLOUDFLARE_ACCOUNT_ID in .env.local; otherwise the script
 * uses the first account returned by the API.
 *
 * Usage: node scripts/update-d1-uuid.mjs
 * Or:    make update-d1-uuid  (loads .env.local and runs this script)
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const ENV_PATH = join(ROOT, ".env.local");
const WRANGLER_PATH = join(ROOT, "wrangler.json");

function loadEnv() {
  try {
    const raw = readFileSync(ENV_PATH, "utf8");
    const env = {};
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
    return env;
  } catch (e) {
    if (e.code === "ENOENT") {
      console.error("Missing .env.local. Add CLOUDFLARE_API_TOKEN (and optionally CLOUDFLARE_ACCOUNT_ID).");
    } else {
      console.error("Failed to read .env.local:", e.message);
    }
    process.exit(1);
  }
}

function getWrangler() {
  try {
    return JSON.parse(readFileSync(WRANGLER_PATH, "utf8"));
  } catch (e) {
    console.error("Failed to read wrangler.json:", e.message);
    process.exit(1);
  }
}

function writeWrangler(obj) {
  try {
    writeFileSync(WRANGLER_PATH, JSON.stringify(obj, null, 2) + "\n", "utf8");
  } catch (e) {
    console.error("Failed to write wrangler.json:", e.message);
    process.exit(1);
  }
}

async function main() {
  const env = loadEnv();
  const token = env.CLOUDFLARE_API_TOKEN;
  if (!token) {
    console.error("CLOUDFLARE_API_TOKEN not set in .env.local");
    process.exit(1);
  }

  const wrangler = getWrangler();
  const d1 = wrangler.d1_databases?.[0];
  if (!d1) {
    console.error("No d1_databases[0] in wrangler.json");
    process.exit(1);
  }
  const databaseName = d1.database_name || "tokenoverflow-blog";

  let accountId = env.CLOUDFLARE_ACCOUNT_ID;
  if (!accountId) {
    const r = await fetch("https://api.cloudflare.com/client/v4/accounts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await r.json();
    if (!data.success || !data.result?.length) {
      console.error("Could not list accounts. Check CLOUDFLARE_API_TOKEN or set CLOUDFLARE_ACCOUNT_ID in .env.local.");
      if (data.errors?.length) console.error(data.errors);
      process.exit(1);
    }
    accountId = data.result[0].id;
  }

  const listRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const listData = await listRes.json();
  if (!listData.success) {
    console.error("D1 list failed:", listData.errors || listData);
    process.exit(1);
  }

  const list = listData.result || [];
  const db = list.find((d) => (d.name || d.database_name) === databaseName);
  const uuid = db?.uuid ?? db?.id;
  if (!uuid) {
    console.error(`D1 database "${databaseName}" not found. Existing: ${list.map((d) => d.name || d.database_name || d.uuid || d.id).join(", ") || "none"}`);
    process.exit(1);
  }

  if (d1.database_id === uuid) {
    console.log("wrangler.json already has the correct D1 UUID.");
    return;
  }

  d1.database_id = uuid;
  writeWrangler(wrangler);
  console.log("Updated wrangler.json d1_databases[0].database_id to:", uuid);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
