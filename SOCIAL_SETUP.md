# MODO Social Publishing

Admin now includes Content Studio and Social Connections.

Content Studio combines Design + English/Myanmar Copy + CTA + Favourite + target channels in one social-post record.

Live publishing is prepared for OAuth-based platform integrations. Actual API publishing requires developer apps/permissions and server-side credentials for each platform. Keep secrets server-side and never use NEXT_PUBLIC_ variables for secrets.

Recommended flow: Content Studio -> Supabase draft -> OAuth connection -> server-side publish -> platform post ID/status.
