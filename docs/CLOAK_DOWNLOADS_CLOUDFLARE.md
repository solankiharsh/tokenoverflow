# Host Cloak downloads on Cloudflare R2 and enable them on the Cloak page

Step-by-step: build Cloak artifacts, upload them to Cloudflare R2, get public URLs, and wire the tokenoverflow Cloak page to use those URLs.

---

## Step 0: Create the release artifacts (why the Releases page is empty)

GitHub **Releases** only show something after you **create a release** and **upload files**. Those files (DMG, EXE, etc.) come from building the app locally (or in CI). Do this first.

### Prerequisites for building Cloak

- **Node.js** (v18+)
- **Rust:** [rustup](https://rustup.rs) — `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **macOS:** to build the **DMG** you must run the build on macOS (or use CI that runs on macOS). You need Xcode Command Line Tools: `xcode-select --install`
- **Windows:** to build EXE/MSI, run on Windows with Visual Studio Build Tools.
- **Linux:** to build .deb/.rpm/AppImage, run on Linux with the usual dev packages.

### Build and where to find the files

1. Clone and open **invisible-ai-assistant**:
   ```bash
   cd /path/to/invisible-ai-assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the app (this runs `npm run build` for the frontend, then compiles Rust and creates installers):
   ```bash
   npm run tauri build
   ```

4. **Artifacts location** (version in your repo is `0.1.9`, so filenames include that):
   - **macOS DMG:**  
     `src-tauri/target/release/bundle/dmg/`  
     - `Cloak_0.1.9_aarch64.dmg` (Apple Silicon)  
     - `Cloak_0.1.9_x64.dmg` (Intel)
   - **Windows:**  
     `src-tauri/target/release/bundle/msi/` and `src-tauri/target/release/bundle/nsis/`  
     - e.g. `Cloak_0.1.9_x64_en-US.msi`, `Cloak_0.1.9_x64-setup.exe`
   - **Linux:**  
     `src-tauri/target/release/bundle/` — `.deb`, `.AppImage`, `.rpm` (if you built on Linux)

5. **Optional — Publish a GitHub Release:**  
   - On GitHub: **Releases** → **“Create a new release”**.  
   - Tag: e.g. `v0.1.9` (create the tag from your main branch).  
   - Title: e.g. `Cloak 0.1.9`.  
   - Attach the DMG (and other installers) as **Release assets**.  
   - Publish. After that, the Releases page will show the release and the download links (e.g. `https://github.com/solankiharsh/invisible-ai-assistant/releases/download/v0.1.9/Cloak_0.1.9_aarch64.dmg`).

Whether you use GitHub Releases or Cloudflare R2 (or both), you **always** create the artifacts by running `npm run tauri build` in invisible-ai-assistant.

---

## Prerequisites (for Cloudflare R2)

- Cloudflare account
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed (`npm install -g wrangler` or use `npx wrangler`)
- Cloak app (invisible-ai-assistant) and tokenoverflow repos on your machine

---

## Step 1: Build Cloak and collect artifacts

If you haven’t built yet, follow **Step 0** above. Then:

1. Open the **invisible-ai-assistant** project and run `npm run tauri build` (or use the artifacts you already built).

2. Find the built artifacts (see paths in Step 0). For current version **0.1.9** the macOS DMGs are:
   - `src-tauri/target/release/bundle/dmg/Cloak_0.1.9_aarch64.dmg`
   - `src-tauri/target/release/bundle/dmg/Cloak_0.1.9_x64.dmg`

3. Note the **exact file names** and **sizes** (e.g. “13 MB”) — you’ll use them for uploads and optional size labels on the Cloak page.

---

## Step 2: Create an R2 bucket and enable public access

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2** → **Overview**.

2. **Create a bucket:**
   - Click **Create bucket**.
   - Name it (e.g. `cloak-releases`).
   - Region: choose one (e.g. auto or nearest).
   - Create the bucket.

3. **Allow public access** so the Cloak page can link to files directly:
   - Open the bucket → **Settings**.
   - Under **Public access**, click **Allow Access** (or **Connect Domain** if you prefer a custom domain).
   - If you use **R2.dev subdomain**:
     - Enable “R2.dev subdomain” and note the URL, e.g. `https://pub-<id>.r2.dev`.
     - Public object URL will be: `https://pub-<id>.r2.dev/<bucket-name>/<key>`.
   - If you use a **custom domain** (e.g. `downloads.yoursite.com`):
     - Add the domain in R2 → **Settings** → **Custom Domains**, then use `https://downloads.yoursite.com/<key>`.

4. Note your **base URL**:
   - R2.dev: `https://pub-xxxx.r2.dev/cloak-releases`
   - Custom domain: `https://downloads.yoursite.com`

---

## Step 3: Upload artifacts to R2

**Option A — Cloudflare Dashboard**

1. Open the bucket → **Objects** → **Upload**.
2. Upload each file (DMG, MSI, EXE, etc.).
3. Use simple, stable keys (e.g. `Cloak_1.0.0_aarch64.dmg`). The download URL will be:  
   `<base-url>/Cloak_1.0.0_aarch64.dmg`.

**Option B — Wrangler CLI**

1. In terminal (from any directory):
   ```bash
   wrangler r2 object put cloak-releases/Cloak_1.0.0_aarch64.dmg --file=./path/to/Cloak_1.0.0_aarch64.dmg
   wrangler r2 object put cloak-releases/Cloak_1.0.0_x64.dmg --file=./path/to/Cloak_1.0.0_x64.dmg
   ```
   Use your bucket name and correct local paths. Repeat for Windows/Linux builds.

2. Set **content type** so browsers treat them as downloads (optional but recommended):
   ```bash
   wrangler r2 object put cloak-releases/Cloak_1.0.0_aarch64.dmg --file=./Cloak_1.0.0_aarch64.dmg --content-type=application/octet-stream
   ```

After upload, each file’s URL is:  
`<base-url>/<object-key>`  
e.g. `https://pub-xxxx.r2.dev/cloak-releases/Cloak_1.0.0_aarch64.dmg`.

---

## Step 4: Set environment variables for the Cloak page

The Cloak page reads **build-time** `VITE_*` variables. You must set them where you run `npm run build` (local or CI).

**Local development**

1. In the **tokenoverflow** repo, create or edit `.env` or `.env.local` (do not commit secrets; `.env.local` is usually gitignored):

   ```env
   # Cloak downloads (R2 or any public URL)
   VITE_CLOAK_VERSION=app-v1.0.0
   VITE_CLOAK_RELEASED=2/17/2026
   VITE_CLOAK_DOWNLOADS=0

   # macOS — replace with your R2 (or custom domain) URLs
   VITE_CLOAK_DMG_ARM64=https://pub-xxxx.r2.dev/cloak-releases/Cloak_1.0.0_aarch64.dmg
   VITE_CLOAK_DMG_X64=https://pub-xxxx.r2.dev/cloak-releases/Cloak_1.0.0_x64.dmg
   VITE_CLOAK_DMG_ARM64_SIZE=13 MB
   VITE_CLOAK_DMG_X64_SIZE=14 MB

   # Windows (add when you have builds)
   # VITE_CLOAK_WIN_EXE=https://pub-xxxx.r2.dev/cloak-releases/Cloak_1.0.0_x64-setup.exe
   # VITE_CLOAK_WIN_MSI=https://pub-xxxx.r2.dev/cloak-releases/Cloak_1.0.0_x64_en-US.msi

   # Linux (add when you have builds)
   # VITE_CLOAK_LINUX_APPIMAGE=...
   # VITE_CLOAK_LINUX_DEB=...
   # VITE_CLOAK_LINUX_RPM=...

   # Optional: link to install / troubleshooting doc
   # VITE_CLOAK_MACOS_INSTALL_DOC=https://github.com/yourorg/invisible-ai-assistant/wiki/Install-macOS
   ```

2. Replace `pub-xxxx.r2.dev` and `cloak-releases` (and file names) with your actual R2 base URL and object keys.

**Production (e.g. GitHub Actions or deploy script)**

1. Where you run `npm run build` for tokenoverflow, export the same variables (or use a `.env.production` that isn’t committed):
   ```bash
   export VITE_CLOAK_VERSION=app-v1.0.0
   export VITE_CLOAK_RELEASED=2/17/2026
   export VITE_CLOAK_DMG_ARM64=https://pub-xxxx.r2.dev/cloak-releases/Cloak_1.0.0_aarch64.dmg
   export VITE_CLOAK_DMG_X64=https://pub-xxxx.r2.dev/cloak-releases/Cloak_1.0.0_x64.dmg
   # ... etc.
   npm run build
   ```

2. If you use **GitHub Actions**, add these as **repository secrets** (e.g. `VITE_CLOAK_DMG_ARM64`, `VITE_CLOAK_DMG_X64`, …) and pass them into the job env so `npm run build` sees them.

3. **Important:** `VITE_*` are baked in at **build time**. Cloudflare Workers `vars` in `wrangler.json` are runtime vars for the worker; they are **not** used as `import.meta.env` in the Vite bundle. So you must set `VITE_CLOAK_*` in the environment that runs `npm run build`, not only in wrangler.

---

## Step 5: Rebuild and deploy tokenoverflow

1. From the tokenoverflow repo:
   ```bash
   cd /path/to/tokenoverflow
   npm run build
   ```

2. Deploy as you usually do (e.g. `npm run deploy` or `wrangler deploy`).

3. Open your site’s `/cloak` page and confirm the download buttons point to the R2 URLs and that the files download correctly.

---

## Step 6: Updating releases later

1. Build a new Cloak version (e.g. 1.0.1).
2. Upload the new artifacts to the same R2 bucket (same or new keys, e.g. `Cloak_1.0.1_aarch64.dmg`).
3. Update tokenoverflow env (or CI secrets):
   - `VITE_CLOAK_VERSION=app-v1.0.1`
   - `VITE_CLOAK_RELEASED=<date>`
   - `VITE_CLOAK_DMG_ARM64=https://.../Cloak_1.0.1_aarch64.dmg`
   - (and optionally `VITE_CLOAK_DOWNLOADS` if you track it).
4. Rebuild and redeploy tokenoverflow.

---

## Env reference (Cloak page)

| Variable | Purpose |
|---------|--------|
| `VITE_CLOAK_VERSION` | Shown as “Latest: …” (e.g. `app-v1.0.0`). |
| `VITE_CLOAK_RELEASED` | Shown as “Released &lt;date&gt;”. |
| `VITE_CLOAK_DOWNLOADS` | Shown as “&lt;n&gt; downloads”. |
| `VITE_CLOAK_DMG_ARM64` | URL for macOS Apple Silicon DMG. |
| `VITE_CLOAK_DMG_X64` | URL for macOS Intel DMG. |
| `VITE_CLOAK_DMG_*_SIZE` | Optional label (e.g. `13 MB`). |
| `VITE_CLOAK_WIN_EXE` / `VITE_CLOAK_WIN_MSI` | Windows installers. |
| `VITE_CLOAK_LINUX_RPM` / `_APPIMAGE` / `_DEB` | Linux packages. |
| `VITE_CLOAK_MACOS_INSTALL_DOC` | Optional URL for macOS install/troubleshooting. |

Any URL not set will show that download option as disabled (“Coming soon”) on the Cloak page.
