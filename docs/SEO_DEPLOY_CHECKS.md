# SEO Deploy Checks

Run these after every production deploy to `solharsh.com`.

## 1. Sitemap (highest priority)

```bash
# Must return HTTP 200 and valid XML
curl -fsS https://solharsh.com/sitemap.xml | xmllint --noout -
echo "Exit code: $? (0 = valid XML)"

# Check URL count (should be 4+ static + N blog posts)
curl -sS https://solharsh.com/sitemap.xml | grep -c '<loc>'
```

## 2. Security headers

```bash
curl -sI https://solharsh.com | grep -Ei \
  'strict-transport-security|x-content-type-options|x-frame-options|content-security-policy|referrer-policy|permissions-policy'
```

All six should be present.

## 3. Meta title / description

```bash
curl -sS https://solharsh.com/ | grep -E '<title|<meta name="description"'
```

- Title: 30–65 chars
- Description: 70–160 chars

## 4. Canonical tags

```bash
for path in "" about projects blog; do
  url="https://solharsh.com/${path}"
  echo "--- $url"
  curl -sS "$url" | grep 'rel="canonical"'
done
```

Each page should emit exactly one canonical that matches its URL.

## 5. Robots.txt

```bash
curl -fsS https://solharsh.com/robots.txt
```

Should return HTTP 200 and contain `Sitemap:` line.

## 6. OG image accessibility

```bash
curl -sSo /dev/null -w "%{http_code}" https://solharsh.com/og-default.png
```

Must return `200`.

## 7. SSL / Cloudflare

- Cloudflare dashboard → SSL/TLS → set to **Full (strict)** (not "Flexible").
- DNS apex (`solharsh.com`) must have a proxied A/AAAA record pointing to CF.
- Run: `curl -sI https://solharsh.com | grep -i 'cf-ray'` to confirm CF is in the path.

## 8. Compression

```bash
curl -sI -H 'Accept-Encoding: br' https://solharsh.com/ | grep -i content-encoding
```

Should respond with `br` (Brotli) — enabled by default on Cloudflare Workers.

## 9. Re-run full SEO audit

After all checks pass, submit `https://solharsh.com/sitemap.xml` to Google Search Console
and re-run the third-party SEO auditor to verify score improvements.
