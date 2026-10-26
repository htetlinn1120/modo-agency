# Cloudflare Pages deployment

This repository is configured for a static Next.js export.

## Build settings

- Production branch: `main`
- Framework preset: `Next.js (Static HTML Export)`
- Build command: `npm run build`
- Build output directory: `out`
- Node.js version: 22 or newer

## Build environment variables

Add these in Cloudflare Pages → Settings → Environment variables, for both Production and Preview if both are used:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

These values are embedded by Next.js at build time, so trigger a new deployment after setting or changing them.

## Notes

- Public pages read the editable Services, Clients, Projects, and Insights content from the Supabase `public.modo_content` table.
- The admin login uses Supabase Auth. Keep row-level security enabled on `modo_content` and ensure only authorized admin users can write.
- This deployment uses Cloudflare Pages static hosting; it does not require a Cloudflare Worker.
- The `public/_headers` file supplies security headers on Pages.
