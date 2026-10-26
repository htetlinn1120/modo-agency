# MODO — Cloudflare-only deployment

The application is being moved off Netlify and Supabase content storage to Cloudflare Pages Functions, D1, and R2. The Next.js UI is exported as static files; the Cloudflare Pages Functions provide the API and protected admin session.

## Cloudflare Pages build

- Production branch: `main`
- Framework preset: `Next.js (Static HTML Export)`
- Build command: `npm run build`
- Build output directory: `out`
- Node.js version: 22 or newer

## Required Cloudflare resources

Create a D1 database named `modo-content` and an R2 bucket named `modo-media`. Update `database_id` in `wrangler.toml` with the actual D1 database ID. Bindings must be named exactly `DB` and `MEDIA`.

Apply the SQL migration in `migrations/0001_initial.sql` to the D1 database before testing Admin.

## Required secrets

In Cloudflare Pages → Settings → Variables and Secrets, configure for Production (and Preview only if needed):

- `ADMIN_EMAIL` — the admin login email
- `ADMIN_PASSWORD` — a long, unique admin password; configure as a secret, never commit it

Do not add Netlify or Supabase environment variables for this Cloudflare-native content/auth implementation.

## Admin and content API

- `/admin/login/` authenticates against the two Cloudflare secrets.
- The server stores only a SHA-256 hash of a random 12-hour session token in D1. The browser receives an HttpOnly, Secure, SameSite=Strict cookie.
- `/admin/*` is protected by a Pages Functions middleware.
- `GET /api/content` serves published content.
- `PUT /api/content` requires a valid admin session and writes to D1.
- `POST /api/media` accepts JPG, PNG, WebP, and AVIF uploads up to 10 MB into R2; `GET /api/media/uploads/...` serves those objects.

## Important

A GitHub commit does not itself prove the Cloudflare deployment is live. After resources and bindings are configured, deploy from `main`, then test the public website, admin login, protected `/admin/` route, content save/reload, and media upload. Do not mark the migration complete until those checks pass.
