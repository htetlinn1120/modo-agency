# MODO Admin — Current Setup

The current admin implementation uses Supabase Auth, the `admin_users` allow-list, the `site_content` table, and the `modo-media` Storage bucket.

Follow **README_SUPABASE_SETUP.md** for the complete free-plan setup.

Important:
- Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Netlify Environment Variables.
- Run `supabase/schema.sql` in Supabase SQL Editor.
- Create an admin user in Supabase Authentication and add that user's UUID to `public.admin_users`.
- Do not place a Supabase service-role or secret key in client-side code.
- Changes are committed only to the `preview` branch. Do not merge to `main` until Netlify preview build, login, database save, and media upload tests succeed.
