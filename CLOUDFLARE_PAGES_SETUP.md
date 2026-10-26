# MODO — Cloudflare-only deployment

The application uses Cloudflare Pages static output plus Pages Functions, D1 for editable content/admin sessions, and R2 for media. Netlify and Supabase are not part of this deployment.

## Existing production project

- GitHub repository: `htetlinn1120/modo-agency`
- Production branch: `main`
- Custom domain: `modobrandingdigital.org`
- Build command: `npm run build`
- Build output directory: `out`
- Node.js: 22 or newer

Keep the existing Cloudflare zone and domain records. Do not replace nameservers or delete existing DNS/mail records as part of this deployment.

## Cloudflare Pages configuration

In the existing Pages project, use the `main` branch and configure the build command/output above. Under Settings → Bindings, add the following bindings to both Production and Preview only if Preview should use separate test data:

- D1 database binding name: `DB`; select the existing database `modo-content`.
- R2 bucket binding name: `MEDIA`; select the existing bucket `modo-media`.

The current `wrangler.toml` uses dashboard-managed Pages bindings. A `database_id` is not needed when the D1 binding is selected in the Pages dashboard. Do not create a second database if `modo-content` already exists.

Apply `migrations/0001_initial.sql` to the selected D1 database once. It creates the `content` and `admin_sessions` tables.

## Admin secrets

Under Pages → Settings → Variables and Secrets, configure Production secrets:

- `ADMIN_EMAIL`: the admin login email.
- `ADMIN_PASSWORD`: a long, unique admin password.

Do not commit credentials to GitHub. Keep secrets in Cloudflare. Preview should use separate credentials/data if enabled.

## Implemented routes

- `/admin/login/`: admin login.
- `/admin/*`: Pages Functions middleware checks the admin session.
- `GET /api/content`: reads published content from D1.
- `PUT /api/content`: requires an admin session and writes content to D1.
- `POST /api/media`: authenticated image upload to R2 (JPG, PNG, WebP, AVIF; max 10 MB).
- `GET /api/media/uploads/...`: serves uploaded R2 objects.

## Verification required before calling it live

A GitHub commit alone does not prove Cloudflare deployment is live. After confirming the existing Pages bindings and secrets, verify:

1. The custom domain opens the intended website.
2. Admin login succeeds and unauthenticated `/admin/` redirects to login.
3. Save a content change, refresh, and confirm it persists.
4. Upload an image and confirm the returned media URL opens.
5. Confirm existing DNS and email records remain unchanged.

Do not mark the migration complete until these checks pass.
