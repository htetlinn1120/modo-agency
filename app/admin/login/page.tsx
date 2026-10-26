"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "../../../lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [notAuthorized, setNotAuthorized] = React.useState(false);
  React.useEffect(() => { setNotAuthorized(new URLSearchParams(window.location.search).get("error") === "not-authorized"); }, []);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw userError || new Error("Could not verify your account.");
      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userData.user.id)
        .maybeSingle();
      if (adminError) throw adminError;
      if (!admin) {
        await supabase.auth.signOut();
        throw new Error("This account is not an approved MODO admin. Add its user UUID to public.admin_users first.");
      }
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Check your Supabase setup.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-5 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md border border-white/10 bg-[#101010] p-7 md:p-10">
        <Link href="/" className="text-xs text-neutral-500 hover:text-white">← Back to website</Link>
        <p className="mt-10 text-xs uppercase tracking-[.25em] text-neutral-500">MODO · Content Manager</p>
        <h1 className="mt-3 text-3xl tracking-tight">Admin sign in</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500">Sign in with the admin account created in Supabase.</p>
        {notAuthorized && <p className="mt-5 border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">This account does not have MODO admin access.</p>}
        {error && <p role="alert" className="mt-5 border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
        <label className="mt-7 block text-sm text-neutral-300">Email
          <input autoComplete="username" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-black px-4 py-3 outline-none focus:border-white/50" />
        </label>
        <label className="mt-4 block text-sm text-neutral-300">Password
          <input autoComplete="current-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-black px-4 py-3 outline-none focus:border-white/50" />
        </label>
        <button disabled={busy} className="mt-7 w-full rounded-full bg-white px-5 py-3 text-sm font-medium text-black disabled:opacity-50">
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="mt-5 text-xs leading-relaxed text-neutral-600">Access is limited to accounts explicitly added to the MODO admin allow-list.</p>
      </form>
    </main>
  );
}
