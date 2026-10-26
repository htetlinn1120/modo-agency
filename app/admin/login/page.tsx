"use client";

import React from "react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Login failed");
      window.location.assign("/admin/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login မအောင်မြင်ပါ။");
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
          <p className="mt-2 text-sm leading-6 text-neutral-600">Sign in to manage MODO website content.</p>
          {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm leading-6 text-red-800">{error}</p>}
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <label className="block text-sm font-medium">Email address
              <input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-base outline-none transition focus:border-black" placeholder="Admin email" />
            </label>
            <label className="block text-sm font-medium">Password
              <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-base outline-none transition focus:border-black" placeholder="Admin password" />
            </label>
            <button type="submit" disabled={busy} className="w-full rounded-full bg-[#171916] px-5 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
          </form>
        </div>
      </div>
    </main>
  );
}
