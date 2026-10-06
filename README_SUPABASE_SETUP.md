# MODO — Final Production Setup

## A. Supabase (do this once)
1. Supabase Dashboard → SQL Editor → paste the entire `supabase/schema.sql` → Run.
2. Authentication → Users → Add user → create the private admin email/password.
3. Copy that user's UUID.
4. SQL Editor → run:
   `insert into public.admin_users(user_id) values ('PASTE-UUID-HERE') on conflict do nothing;`

## B. Netlify Environment Variables
Add exactly:
- `NEXT_PUBLIC_SUPABASE_URL` = your Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = your Supabase publishable key
Never add the service-role/secret key to the browser.

## C. Admin
- `/admin` is protected by `proxy.ts`.
- A valid Supabase session is required.
- The authenticated user must exist in `admin_users`.
- Database and Storage writes are RLS-protected to approved admins.
- `/admin` is noindex and robots disallowed.

## D. CMS
Admin can manage Services, Clients, Portfolio, Insights and Homepage Banners.
Changes are saved to Supabase; localStorage is only a temporary fallback if a table has not been seeded yet.

## E. Banner
Upload to Admin → Banners. Recommended: 1920×700 or 1920×800 WebP/JPG. Keep text inside the center 70% for mobile cropping.

## F. Custom Domain
Netlify → Domain management → add `modobrandingdigital.org`. Keep Cloudflare DNS as the DNS provider and use the records Netlify shows for the domain. Do not transfer the domain to Netlify.
