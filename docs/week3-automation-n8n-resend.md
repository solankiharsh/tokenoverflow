# Week 3 — Automation (n8n + Resend + CRM)

Run n8n on the same VPS as your other services (Docker is typical). Use this doc as a checklist; adjust hostnames and secrets for your environment.

## 1. n8n on the box

- Install Docker (or use the stack you already use).
- Run n8n with a persistent volume and a strong encryption key, behind HTTPS (Caddy, nginx, or Traefik).
- Restrict the n8n UI to VPN, SSH tunnel, or IP allowlist unless you are comfortable with auth + rate limits on the public URL.

Example (illustrative only):

```bash
docker run -d --name n8n \
  -p 5678:5678 \
  -e N8N_ENCRYPTION_KEY="$(openssl rand -hex 32)" \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

## 2. Lead → CRM workflow

Your site already exposes `POST /api/crm/submit` (JSON: `email`, `form_type`, optional `name`, `company`, `message`, `metadata`).

**Option A — n8n receives the webhook first**

1. Form or middleware posts to n8n **Webhook** node (public URL).
2. n8n **HTTP Request** node: `POST` to `https://your-domain.com/api/crm/submit` with the same JSON body (and optional dedupe / spam checks in n8n).
3. Optional branches: Slack, Telegram, or Airtable in parallel.

**Option B — Site posts to CRM only; n8n polls or uses Cron**

- Less ideal for instant alerts; use A if you want real-time automation.

## 3. Welcome email drip (Resend)

1. Create [Resend](https://resend.com) account, verify sending domain, create API key.
2. In n8n: **HTTP Request** nodes calling `https://api.resend.com/emails` with `Authorization: Bearer re_...`.
3. Workflow: trigger on “new lead” (from webhook payload or from a “wait 5 minutes” after CRM submit).
4. Sequence: email 0 (immediate thank-you), email 1 (+2 days), email 2 (+7 days) using **Wait** nodes or n8n’s queue.

Store templates as HTML in n8n or fetch from your repo / CMS.

## 4. Booking follow-up

- If you use Cal.com / Calendly, add their **webhook** to n8n on `booking.created`.
- n8n: send Resend “see you at …” email, optional **HTTP Request** to log an activity (if you add a protected admin API or serverless function that inserts into `activities`).

## 5. Secrets and safety

- Keep `RESEND_API_KEY` and n8n credentials in n8n’s credential store, not in workflow JSON you commit.
- Do not expose `/api/admin/crm/*` publicly; they are Clerk-gated.
- Rate-limit public `/api/crm/submit` at the edge (Cloudflare WAF / Turnstile) if spam appears.

## 6. Optional: Worker → Resend directly

For a single welcome email without n8n, you could call Resend from a Cloudflare Worker route after `handleFormSubmission` — that couples email to deploys; n8n keeps ops and copy changes out of code.
