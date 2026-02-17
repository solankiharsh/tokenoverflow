# Get Cloak downloadable in 3 steps

Use this checklist so people can download Cloak from your site.

---

## What you have

After `npm run tauri build` in **invisible-ai-assistant**:

| File | Path (in invisible-ai-assistant) |
|------|----------------------------------|
| **Apple Silicon DMG** | `src-tauri/target/release/bundle/dmg/Cloak_0.1.9_aarch64.dmg` |
| **Intel DMG** | `src-tauri/target/release/bundle/dmg/Cloak_0.1.9_x64.dmg` (only if you built on Intel or universal) |

You only need the **Apple Silicon** one to start (most Macs today). Add Intel later if you build it.

---

## Option A: GitHub Releases (simplest)

**Where:** GitHub, same repo as the app.

1. Open **https://github.com/solankiharsh/invisible-ai-assistant**
2. **Releases** → **Create a new release**
3. **Tag:** `v0.1.9` (create from main)
4. **Title:** `Cloak 0.1.9`
5. **Attach:** drag `Cloak_0.1.9_aarch64.dmg` into “Release assets”
6. **Publish**
7. Copy the asset URL, e.g.  
   `https://github.com/solankiharsh/invisible-ai-assistant/releases/download/v0.1.9/Cloak_0.1.9_aarch64.dmg`

**Wire tokenoverflow:**

8. In **tokenoverflow**, create or edit `.env` (or `.env.local`):
   ```env
   VITE_CLOAK_VERSION=app-v0.1.9
   VITE_CLOAK_RELEASED=2/17/2026
   VITE_CLOAK_DMG_ARM64=https://github.com/solankiharsh/invisible-ai-assistant/releases/download/v0.1.9/Cloak_0.1.9_aarch64.dmg
   ```
9. Rebuild and deploy tokenoverflow:  
   `npm run build && npm run deploy` (or your deploy command)

Result: your **tokenoverflow** `/cloak` page will have an “Apple Silicon” button that downloads from GitHub. No R2 or extra hosting.

---

## Option B: Cloudflare R2 (your own URLs)

**Where:** Cloudflare R2 bucket.

1. **Dashboard:** [dash.cloudflare.com](https://dash.cloudflare.com) → **R2** → **Create bucket** (e.g. `cloak-releases`)
2. **Public access:** Bucket → **Settings** → **Public access** → enable **R2.dev subdomain**. Note the URL, e.g. `https://pub-xxxx.r2.dev`
3. **Upload:** Bucket → **Objects** → **Upload** → select `Cloak_0.1.9_aarch64.dmg`. The object key can be the filename: `Cloak_0.1.9_aarch64.dmg`
4. **Public URL:**  
   `https://pub-xxxx.r2.dev/cloak-releases/Cloak_0.1.9_aarch64.dmg`  
   (replace `pub-xxxx` and `cloak-releases` with your bucket’s public host and name)

**Wire tokenoverflow:**

5. In **tokenoverflow** `.env`:
   ```env
   VITE_CLOAK_VERSION=app-v0.1.9
   VITE_CLOAK_RELEASED=2/17/2026
   VITE_CLOAK_DMG_ARM64=https://pub-xxxx.r2.dev/cloak-releases/Cloak_0.1.9_aarch64.dmg
   ```
6. Rebuild and deploy tokenoverflow.

Full R2 steps (including wrangler) are in [CLOAK_DOWNLOADS_CLOUDFLARE.md](./CLOAK_DOWNLOADS_CLOUDFLARE.md).

---

## Option C: Serve from tokenoverflow (only if the DMG is small)

**Where:** Inside the tokenoverflow repo so it’s deployed with the site.

- **Limitation:** Cloudflare Workers/Pages have bundle size limits. A DMG is often 20–50 MB, which is usually too large to commit and deploy as a static asset. Use this only if your DMG is small (e.g. &lt; 10 MB) and you’re on a plan that allows it.

If you still want to try:

1. In **tokenoverflow**, create a folder for static assets if it doesn’t exist (e.g. `public/` at project root). With Vite, files in `public/` are served at the site root.
2. Copy the DMG into it, e.g.  
   `cp /path/to/invisible-ai-assistant/src-tauri/target/release/bundle/dmg/Cloak_0.1.9_aarch64.dmg tokenoverflow/public/`
3. In **tokenoverflow** `.env`, point to your own origin:  
   `VITE_CLOAK_DMG_ARM64=/Cloak_0.1.9_aarch64.dmg`  
   (or your full site URL + path, e.g. `https://yoursite.com/Cloak_0.1.9_aarch64.dmg`)
4. Rebuild and deploy. If the deployment fails or exceeds size limits, use **Option A** or **B** instead.

---

## Env vars tokenoverflow uses (reference)

Set these where you run `npm run build` (e.g. `.env` for local, CI/deploy env for production).

| Variable | Example | Purpose |
|----------|--------|--------|
| `VITE_CLOAK_VERSION` | `app-v0.1.9` | Shown as “Latest: …” |
| `VITE_CLOAK_RELEASED` | `2/17/2026` | “Released &lt;date&gt;” |
| `VITE_CLOAK_DMG_ARM64` | `https://.../Cloak_0.1.9_aarch64.dmg` | **Required** for Apple Silicon download button |
| `VITE_CLOAK_DMG_X64` | (optional) | Intel Mac DMG |
| `VITE_CLOAK_DMG_ARM64_SIZE` | `25 MB` | Optional label next to button |

---

## Quick “go live” checklist

- [ ] DMG built: `invisible-ai-assistant/src-tauri/target/release/bundle/dmg/Cloak_0.1.9_aarch64.dmg`
- [ ] File uploaded somewhere: **GitHub Release** (Option A) or **R2** (Option B)
- [ ] `VITE_CLOAK_DMG_ARM64` set in tokenoverflow (in `.env` or deploy env) to that file’s URL
- [ ] tokenoverflow rebuilt and deployed
- [ ] Open **your-site.com/cloak** and click “Apple Silicon” → download starts

After that, people can download and use Cloak from your site.
