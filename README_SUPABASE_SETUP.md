# MODO Admin Dashboard — Supabase Free Setup

The CMS code is committed to the `preview` branch. Production `main` has not been changed.

## 1. Create a free Supabase project
1. Open https://supabase.com/dashboard and sign in.
2. Choose **New project**.
3. Select your free organization, enter a project name such as `modo-cms`, create a strong database password, and choose a nearby region.
4. Wait for the project to finish provisioning.

Supabase Free has usage limits and may pause inactive projects. No paid add-on is required for this setup within free limits.

## 2. Create the database and media bucket
1. In Supabase, open **SQL Editor**.
2. In GitHub, open `supabase/schema.sql` on the `preview` branch and copy the entire file.
3. Paste it into SQL Editor and press **Run**.
4. Confirm the script finishes without an error. It creates `admin_users`, `site_content`, RLS policies, and the public `modo-media` bucket. Public visitors can read site content/media; only allow-listed admins can write.

## 3. Create the first admin account
1. Supabase → **Authentication → Users** → **Add user**.
2. Create your private admin email and a strong password. Do not use a shared/public email.
3. Copy the new user's **UID**.
4. Supabase → **SQL Editor**, run this after replacing the UUID:
   `insert into public.admin_users (user_id) values ('PASTE-USER-UUID-HERE') on conflict do nothing;`
5. Never add public visitors to this allow-list.

## 4. Add Netlify environment variables
In Netlify → your MODO site → **Site configuration → Environment variables**, add these variables for the site and its deploy contexts:
- `NEXT_PUBLIC_SUPABASE_URL` = Supabase **Project URL**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = Supabase **Publishable key** (the public `sb_publishable_...` key; if your dashboard only exposes the legacy anon key, that can be used instead)

Do **not** place the `service_role` key or any secret key in a `NEXT_PUBLIC_` variable or browser code.

Then trigger a deploy of the Netlify deploy that uses the GitHub `preview` branch. If Netlify currently builds only `main`, create a Deploy Preview by opening a pull request from `preview` into `main`; do not merge it yet.

## 5. Test the admin
1. Open the Preview URL and go to `/admin/login`.
2. Sign in using the Supabase user and password created above.
3. Open Services, Clients, Projects or Insights, make a small test change and press **Save changes**.
4. Confirm the record appears in Supabase → Table Editor → `site_content`.
5. Open the public preview in another browser/device to confirm content comes from the shared database.
6. For client logo uploads, select an image in Clients. It uploads to the `modo-media` bucket; then press **Save changes**.

## Notes
- The current dashboard writes shared Services, Clients, Projects and Insights JSON to Supabase; the homepage reads those records and falls back to bundled content when no record exists.
- Netlify deployment and Supabase account setup still require the account owner to click through the dashboards. Do not paste passwords, service-role keys, or other secrets into chat.
- Keep testing on `preview`. Merge to `main` only after the Preview build and admin login/save/upload tests pass.
