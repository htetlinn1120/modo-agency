"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AcceptPlannerInvitePage() {
  const searchParams=useSearchParams();
  const router=useRouter();
  const token=String(searchParams.get("token")||"");
  const [password,setPassword]=React.useState("");
  const [confirm,setConfirm]=React.useState("");
  const [busy,setBusy]=React.useState(false);
  const [error,setError]=React.useState("");

  async function submit(event:React.FormEvent) {
    event.preventDefault(); setError("");
    if(password.length<12) {setError("Use a password with at least 12 characters.");return;}
    if(password!==confirm) {setError("Passwords do not match.");return;}
    setBusy(true);
    try {
      const response=await fetch("/api/planner/auth/accept-invite",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,password})});
      const result=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(result.error||"Invitation could not be accepted");
      router.replace("/planner/");
    } catch(e) {setError(e instanceof Error?e.message:"Invitation could not be accepted");}
    finally {setBusy(false);}
  }

  return <main className="min-h-screen bg-[#f4f5f1] px-5 py-12 text-neutral-900"><div className="mx-auto max-w-md">
    <p className="text-xs font-bold uppercase tracking-[.22em] text-neutral-500">MODO / TEAM INVITATION</p>
    <h1 className="mt-4 text-4xl font-semibold tracking-tight">Join the workspace</h1>
    <p className="mt-3 text-sm leading-6 text-neutral-600">Set a password to activate your invited account. Invitation links can only be used once and expire after seven days.</p>
    <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <label className="block text-xs font-semibold text-neutral-600">Create password<input required minLength={12} maxLength={256} type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm text-neutral-900"/></label>
      <label className="block text-xs font-semibold text-neutral-600">Confirm password<input required minLength={12} maxLength={256} type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm text-neutral-900"/></label>
      {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={busy||!token} className="w-full rounded-xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy?"Activating account…":"Accept invitation"}</button>
    </form>
  </div></main>;
}
