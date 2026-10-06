# MODO Final Admin

This package keeps the existing MODO website/domain structure. It does not change or transfer `modobrandingdigital.org`.

Supabase URL and the public Publishable key are embedded in the client/server configuration so the local `.env.local` file is not required for this build.

Admin login still uses Supabase Auth and the `public.admin_users` allow-list. The Supabase project must contain the admin user and its UUID in `public.admin_users`.

The login page now has a 12-second timeout instead of remaining on `Signing in…` forever.
