"use client";

import React from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
}

export default function AdminLoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [configured, setConfigured] = React.useState(true);

  React.useEffect(() => {
    setConfigured(Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY));
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "not-authorized") {
      setError("ဒီ account ကို Admin ခွင့်ပြုချက် မပေးရသေးပါ။ Supabase admin_users table ကို စစ်ဆေးပါ။");
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const supabase = getSupabase();
      if (!supabase) {
        setError("Supabase environment variables မပြည့်စုံပါ။ Netlify Environment variables ကို စစ်ပြီး redeploy လုပ်ပါ။");
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) {
        setError(signInError.message === "Invalid login credentials"
          ? "Email သို့မဟုတ် Password မှားနေပါတယ်။"
          : signInError.message);
        return;
      }
      window.location.assign("/admin");
    } catch {
      setError("Login မအောင်မြင်ပါ။ Internet connection နဲ့ Supabase configuration ကို စစ်ပါ။");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f5f1] px-5 py-12 text-[#171916]">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-12 inline-flex items-center">
          <img src="/modo-logo.png" alt="MODO" className="h-auto w-24" />
        </Link>
        <div className="rounded-2xl border border-black/10 bg-white p-7 shadow-sm sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">MODO / Secure access</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Admin login</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">Sign in with the administrator account registered in Supabase.</p>
          {!configured && (
            <p role="alert" className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              Supabase configuration မပြည့်စုံပါ။ Netlify မှာ NEXT_PUBLIC_SUPABASE_URL နဲ့ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ကို စစ်ပြီး redeploy လုပ်ပါ။
            </p>
          )}
          {error && (
            <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm leading-6 text-red-800">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <label className="block text-sm font-medium">
              Email address
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-base outline-none transition focus:border-black"
                placeholder="admin@example.com"
              />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-base outline-none transition focus:border-black"
                placeholder="Enter your password"
              />
            </label>
            <button
              type="submit"
              disabled={busy || !configured}
              className="w-full rounded-full bg-[#171916] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
        <p className="mt-5 text-xs leading-5 text-neutral-500">Access is restricted to accounts approved in the MODO admin_users table.</p>
      </div>
    </main>
  );
}
