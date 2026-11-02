"use client";

import React from "react";

type User = { id: string; email: string; name: string; role: "owner" | "admin" | "staff" | "client"; clientId: string | null };
type Workspace = { id: string; slug: string; name: string; logoUrl?: string | null; primaryColor: string; customDomain?: string | null };
type Client = { id: string; name: string; industry: string; contactEmail: string; notes: string };
type Post = { id: string; clientId: string; clientName: string; title: string; caption: string; platform: string; format: string; publishAt: string | null; status: string; clientFeedback: string };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/planner/${path}`, { ...init, credentials: "same-origin", cache: "no-store" });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Request failed");
  return result as T;
}

const inputClass = "w-full rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 outline-none focus:border-neutral-500";
const buttonClass = "rounded-xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50";
const cardClass = "rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm";

export default function PlannerPage() {
  const [user, setUser] = React.useState<User | null>(null);
  const [workspace, setWorkspace] = React.useState<Workspace | null>(null);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [view, setView] = React.useState("overview");
  const [workspaceSlug, setWorkspaceSlug] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [clientName, setClientName] = React.useState("");
  const [industry, setIndustry] = React.useState("");
  const [postTitle, setPostTitle] = React.useState("");
  const [postClient, setPostClient] = React.useState("");
  const [postCaption, setPostCaption] = React.useState("");
  const [publishAt, setPublishAt] = React.useState("");
  const [brandName, setBrandName] = React.useState("");
  const [brandColor, setBrandColor] = React.useState("#dfe52f");

  const refresh = React.useCallback(async () => {
    const me = await api<{ user: User; workspace: Workspace }>("me");
    const [clientResult, postResult] = await Promise.all([
      api<{ clients: Client[] }>("clients"),
      api<{ posts: Post[] }>("posts"),
    ]);
    setUser(me.user);
    setWorkspace(me.workspace);
    setBrandName(me.workspace.name);
    setBrandColor(me.workspace.primaryColor || "#dfe52f");
    setClients(clientResult.clients);
    setPosts(postResult.posts);
    if (!postClient && clientResult.clients[0]) setPostClient(clientResult.clients[0].id);
  }, [postClient]);

  React.useEffect(() => {
    refresh().catch(() => setUser(null));
  }, [refresh]);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      await api("auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceSlug, email, password }) });
      await refresh();
      setNotice("Welcome to your workspace.");
    } catch (e) { setError(e instanceof Error ? e.message : "Login failed"); }
    finally { setBusy(false); }
  }

  async function logout() {
    await api("auth/logout", { method: "POST" }).catch(() => undefined);
    setUser(null); setWorkspace(null); setClients([]); setPosts([]);
  }

  async function addClient(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      await api("clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: clientName, industry }) });
      setClientName(""); setIndustry(""); await refresh(); setNotice("Client workspace created.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not create client"); }
    finally { setBusy(false); }
  }

  async function addPost(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      await api("posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientId: postClient, title: postTitle, caption: postCaption, publishAt: publishAt || null }) });
      setPostTitle(""); setPostCaption(""); setPublishAt(""); await refresh(); setNotice("Draft saved.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save post"); }
    finally { setBusy(false); }
  }

  async function submitPost(id: string) {
    setError(""); setNotice("");
    try { await api(`posts/${id}/submit`, { method: "POST" }); await refresh(); setNotice("Sent for client review."); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not submit post"); }
  }

  async function decide(id: string, action: "approved" | "changes_requested") {
    const comment = action === "changes_requested" ? window.prompt("What needs to be changed?") || "" : "";
    setError(""); setNotice("");
    try {
      await api(`posts/${id}/decision`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, comment }) });
      await refresh(); setNotice(action === "approved" ? "Content approved." : "Revision requested.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save decision"); }
  }

  async function saveBrand(event: React.FormEvent) {
    event.preventDefault(); setError(""); setNotice("");
    try {
      await api("workspace", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: brandName, primaryColor: brandColor }) });
      await refresh(); setNotice("Workspace branding saved.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save branding"); }
  }

  async function uploadMedia(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    const form = new FormData(); form.set("file", file);
    setError(""); setNotice("");
    try { await api("media", { method: "POST", body: form }); setNotice("Image uploaded to private workspace storage."); }
    catch (e) { setError(e instanceof Error ? e.message : "Upload failed"); }
    finally { event.target.value = ""; }
  }

  if (!user || !workspace) {
    return <main className="min-h-screen bg-[#f4f5f1] px-5 py-12 text-neutral-900">
      <div className="mx-auto max-w-md">
        <p className="text-xs font-bold uppercase tracking-[.22em] text-neutral-500">MODO / CONTENT WORKSPACE</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Planner sign in</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">Sign in to your agency workspace to manage clients, content and approvals.</p>
        <form onSubmit={login} className="mt-8 space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <label className="block text-xs font-semibold text-neutral-600">Workspace URL slug
            <input required value={workspaceSlug} onChange={e => setWorkspaceSlug(e.target.value)} className={`${inputClass} mt-2`} placeholder="modo-branding" autoComplete="organization" />
          </label>
          <label className="block text-xs font-semibold text-neutral-600">Email
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className={`${inputClass} mt-2`} placeholder="you@agency.com" autoComplete="username" />
          </label>
          <label className="block text-xs font-semibold text-neutral-600">Password
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className={`${inputClass} mt-2`} placeholder="Your password" autoComplete="current-password" />
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button disabled={busy} className={`${buttonClass} w-full`}>{busy ? "Signing in…" : "Sign in"}</button>
        </form>
        <p className="mt-5 text-center text-xs text-neutral-500">Workspace owner? Ask your platform administrator to provision your workspace.</p>
      </div>
    </main>;
  }

  const isClient = user.role === "client";
  const reviewCount = posts.filter(p => p.status === "in_review").length;
  const nav = isClient ? [["overview","Overview"],["approvals","Review content"]] : [["overview","Overview"],["clients","Clients"],["posts","Content planner"],["approvals","Approvals"],["workspace","Brand settings"]];

  return <main className="min-h-screen bg-[#f4f5f1] text-neutral-900">
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col bg-[#17191a] p-6 text-white md:flex">
        <div className="text-lg font-black tracking-tight">MODO <span className="text-[#dfe52f]">PLANNER</span></div>
        <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[10px] uppercase tracking-widest text-neutral-400">Workspace</p><p className="mt-1 text-sm font-semibold">{workspace.name}</p></div>
        <nav className="mt-8 space-y-1">{nav.map(([key,label]) => <button key={key} onClick={() => setView(key)} className={`w-full rounded-xl px-3 py-3 text-left text-sm ${view===key?"bg-white/10 text-white":"text-neutral-400 hover:bg-white/5 hover:text-white"}`}>{label}</button>)}</nav>
        <div className="mt-auto border-t border-white/10 pt-5"><p className="text-sm font-semibold">{user.name}</p><p className="mt-1 text-xs capitalize text-neutral-400">{user.role}</p><button onClick={logout} className="mt-4 text-xs text-neutral-400 hover:text-white">Sign out ↗</button></div>
      </aside>
      <section className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-5 py-4 md:px-9">
          <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-neutral-400">Agency workspace</p><h1 className="mt-1 text-xl font-semibold">{nav.find(n=>n[0]===view)?.[1] || "Overview"}</h1></div>
          <div className="flex items-center gap-3"><span className="hidden text-xs text-neutral-500 sm:inline">{user.email}</span><button onClick={logout} className="rounded-lg border border-neutral-200 px-3 py-2 text-xs md:hidden">Sign out</button></div>
        </header>
        <div className="mx-auto max-w-6xl space-y-6 p-5 md:p-9">
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {notice && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
          {view==="overview" && <>
            <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-neutral-400">Your content operation</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Welcome, {user.name.split(" ")[0]}.</h2><p className="mt-2 text-sm text-neutral-500">A shared place to plan, create and approve content.</p></div>
            <div className="grid gap-4 sm:grid-cols-3"><div className={cardClass}><p className="text-xs text-neutral-500">Clients</p><p className="mt-3 text-3xl font-semibold">{clients.length}</p></div><div className={cardClass}><p className="text-xs text-neutral-500">Content items</p><p className="mt-3 text-3xl font-semibold">{posts.length}</p></div><div className={cardClass}><p className="text-xs text-neutral-500">Awaiting review</p><p className="mt-3 text-3xl font-semibold">{reviewCount}</p></div></div>
            <div className={cardClass}><div className="flex items-center justify-between"><h3 className="font-semibold">Recent content</h3><button onClick={()=>setView(isClient?"approvals":"posts")} className="text-xs font-semibold text-neutral-500">View all →</button></div><div className="mt-4 space-y-3">{posts.slice(0,5).map(p=><PostRow key={p.id} post={p} isClient={isClient} onSubmit={submitPost} onDecision={decide}/>) }{posts.length===0&&<p className="py-8 text-center text-sm text-neutral-400">No content yet.</p>}</div></div>
          </>}
          {view==="clients" && !isClient && <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><form onSubmit={addClient} className={cardClass}><h3 className="font-semibold">Add a client</h3><p className="mt-1 text-xs text-neutral-500">Create a separate client workspace within this agency.</p><label className="mt-5 block text-xs font-semibold">Client name<input required value={clientName} onChange={e=>setClientName(e.target.value)} className={`${inputClass} mt-2`} placeholder="Brand name"/></label><label className="mt-4 block text-xs font-semibold">Industry<input value={industry} onChange={e=>setIndustry(e.target.value)} className={`${inputClass} mt-2`} placeholder="Beauty, fashion, property…"/></label><button disabled={busy} className={`${buttonClass} mt-5 w-full`}>Create client</button></form><div className={cardClass}><h3 className="font-semibold">Your clients</h3><div className="mt-4 space-y-3">{clients.map(c=><div key={c.id} className="rounded-xl border border-neutral-100 p-4"><p className="font-semibold">{c.name}</p><p className="mt-1 text-xs text-neutral-500">{c.industry||"Industry not set"}</p></div>)}{clients.length===0&&<p className="py-8 text-sm text-neutral-400">No clients created yet.</p>}</div></div></div>}
          {view==="posts" && !isClient && <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><form onSubmit={addPost} className={cardClass}><h3 className="font-semibold">Create content</h3><label className="mt-5 block text-xs font-semibold">Client<select required value={postClient} onChange={e=>setPostClient(e.target.value)} className={`${inputClass} mt-2`}><option value="">Choose client</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label className="mt-4 block text-xs font-semibold">Content title<input required value={postTitle} onChange={e=>setPostTitle(e.target.value)} className={`${inputClass} mt-2`} placeholder="Post title"/></label><label className="mt-4 block text-xs font-semibold">Caption<textarea value={postCaption} onChange={e=>setPostCaption(e.target.value)} className={`${inputClass} mt-2 min-h-28`} placeholder="Write the caption…"/></label><label className="mt-4 block text-xs font-semibold">Publish date<input type="datetime-local" value={publishAt} onChange={e=>setPublishAt(e.target.value)} className={`${inputClass} mt-2`}/></label><button disabled={busy||clients.length===0} className={`${buttonClass} mt-5 w-full`}>Save draft</button><div className="mt-5 border-t border-neutral-100 pt-4"><label className="block text-xs font-semibold">Upload creative to private media library<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={uploadMedia} className="mt-2 block w-full text-xs"/></label></div></form><div className={cardClass}><h3 className="font-semibold">All content</h3><div className="mt-4 space-y-3">{posts.map(p=><PostRow key={p.id} post={p} isClient={false} onSubmit={submitPost} onDecision={decide}/>) }{posts.length===0&&<p className="py-8 text-sm text-neutral-400">No posts yet.</p>}</div></div></div>}
          {view==="approvals" && <div className={cardClass}><h3 className="font-semibold">{isClient?"Content for your review":"Approval inbox"}</h3><p className="mt-1 text-xs text-neutral-500">Review content submitted by the agency team.</p><div className="mt-4 space-y-3">{posts.filter(p=>p.status==="in_review"||p.status==="changes_requested").map(p=><PostRow key={p.id} post={p} isClient={isClient} onSubmit={submitPost} onDecision={decide}/>) }{posts.filter(p=>p.status==="in_review"||p.status==="changes_requested").length===0&&<p className="py-8 text-sm text-neutral-400">Nothing waiting for review.</p>}</div></div>}
          {view==="workspace" && !isClient && <form onSubmit={saveBrand} className={`${cardClass} max-w-2xl`}><h3 className="font-semibold">White-label brand identity</h3><p className="mt-1 text-xs text-neutral-500">Set the name and primary color used by this workspace.</p><label className="mt-5 block text-xs font-semibold">Agency name<input required value={brandName} onChange={e=>setBrandName(e.target.value)} className={`${inputClass} mt-2`}/></label><label className="mt-4 block text-xs font-semibold">Primary color<input type="color" value={brandColor} onChange={e=>setBrandColor(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-neutral-200 bg-white p-2"/></label><div className="mt-5 flex items-center gap-3 rounded-xl border border-neutral-100 p-4"><div className="h-9 w-9 rounded-xl" style={{background:brandColor}}/><span className="text-sm font-semibold">{brandName||workspace.name}</span><span className="ml-auto text-[10px] uppercase tracking-widest text-neutral-400">Preview</span></div><button className={`${buttonClass} mt-5`}>Save branding</button></form>}
        </div>
      </section>
    </div>
  </main>;
}

function PostRow({post,isClient,onSubmit,onDecision}:{post:Post;isClient:boolean;onSubmit:(id:string)=>void;onDecision:(id:string,action:"approved"|"changes_requested")=>void}) {
  const color = post.status==="approved"||post.status==="published"?"bg-green-50 text-green-700":post.status==="in_review"?"bg-amber-50 text-amber-700":post.status==="changes_requested"?"bg-rose-50 text-rose-700":"bg-neutral-100 text-neutral-600";
  return <div className="rounded-xl border border-neutral-100 p-4">
    <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="font-semibold">{post.title}</p><p className="mt-1 text-xs text-neutral-500">{post.clientName} · {post.platform} · {post.publishAt||"No date"}</p></div><span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${color}`}>{post.status.replaceAll("_"," ")}</span></div>
    {post.caption&&<p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-600">{post.caption}</p>}
    {post.clientFeedback&&<p className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-800">Feedback: {post.clientFeedback}</p>}
    <div className="mt-3 flex flex-wrap gap-2">
      {!isClient&&["draft","planned","changes_requested"].includes(post.status)&&<button onClick={()=>onSubmit(post.id)} className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold">Send for approval</button>}
      {isClient&&post.status==="in_review"&&<><button onClick={()=>onDecision(post.id,"approved")} className="rounded-lg bg-neutral-950 px-3 py-2 text-xs font-semibold text-white">Approve</button><button onClick={()=>onDecision(post.id,"changes_requested")} className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold">Request changes</button></>}
    </div>
  </div>;
}
