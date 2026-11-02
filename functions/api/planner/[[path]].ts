interface Env { DB: D1Database; MEDIA: R2Bucket; ADMIN_EMAIL: string; ADMIN_PASSWORD: string; }
type Role = "owner" | "admin" | "staff" | "client";
type UserSession = { userId: string; workspaceId: string; clientId: string | null; role: Role; email: string; name: string; workspaceSlug: string };
const out = (data: unknown, status = 200, headers?: HeadersInit) => Response.json(data, { status, headers: { "Cache-Control": "no-store", ...Object.fromEntries(new Headers(headers).entries()) } });
const now = () => Math.floor(Date.now() / 1000);
const id = () => crypto.randomUUID();
const hex = (n = 16) => Array.from(crypto.getRandomValues(new Uint8Array(n)), b => b.toString(16).padStart(2, "0")).join("");
async function digest(value: string) { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)); return Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, "0")).join(""); }
async function hashPassword(password: string, saltHex: string) {
  const salt = Uint8Array.from(saltHex.match(/.{2}/g) || [], x => parseInt(x, 16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 210000, hash: "SHA-256" }, key, 256);
  return Array.from(new Uint8Array(bits), x => x.toString(16).padStart(2, "0")).join("");
}
function equal(a: string, b: string) { if (a.length !== b.length) return false; let n = 0; for (let i=0;i<a.length;i++) n |= a.charCodeAt(i) ^ b.charCodeAt(i); return n === 0; }
function cookie(req: Request, name: string) { const m = (req.headers.get("Cookie") || "").match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)")); if (!m) return null; try { return decodeURIComponent(m[1]); } catch { return null; } }
function sameOrigin(req: Request) { const o = req.headers.get("Origin"); if (!o) return true; try { return new URL(o).origin === new URL(req.url).origin; } catch { return false; } }
function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,48); }
async function body<T>(req: Request): Promise<T | null> { try { return await req.json() as T; } catch { return null; } }
async function platformAdmin(req: Request, env: Env) {
  const token = cookie(req, "modo_admin_session"); if (!token) return false;
  const row = await env.DB.prepare("SELECT token_hash FROM admin_sessions WHERE token_hash = ? AND expires_at > ?").bind(await digest(token), now()).first();
  return Boolean(row);
}
async function session(req: Request, env: Env): Promise<UserSession | null> {
  const token = cookie(req, "modo_planner_session"); if (!token) return null;
  return await env.DB.prepare("SELECT u.id AS userId,u.workspace_id AS workspaceId,u.client_id AS clientId,u.role,u.email,u.name,w.slug AS workspaceSlug FROM planner_sessions s JOIN planner_users u ON u.id=s.user_id AND u.workspace_id=s.workspace_id JOIN planner_workspaces w ON w.id=s.workspace_id WHERE s.token_hash=? AND s.expires_at>? AND u.is_active=1")
    .bind(await digest(token), now()).first<UserSession>();
}
function allowed(s: UserSession, roles: Role[]) { return roles.includes(s.role); }
function cookieHeader(token: string, age: number) { return `modo_planner_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/api/planner; Max-Age=${age}`; }
async function issueSession(env: Env, user: {id:string;workspace_id:string}) {
  const token = hex(32); await env.DB.prepare("INSERT INTO planner_sessions (token_hash,workspace_id,user_id,expires_at,created_at) VALUES (?,?,?,?,?)").bind(await digest(token),user.workspace_id,user.id,now()+43200,now()).run(); return token;
}
async function postById(env: Env, s: UserSession, postId: string) {
  return env.DB.prepare("SELECT id,client_id AS clientId,title,caption,platform,format,publish_at AS publishAt,status,client_feedback AS clientFeedback FROM planner_posts WHERE id=? AND workspace_id=?").bind(postId,s.workspaceId).first<any>();
}
function segments(params: Record<string,string|string[]>) { const p=params.path; return (Array.isArray(p)?p:[p]).filter(Boolean).map(String); }

export const onRequestGet: PagesFunction<Env> = async ({request,env,params}) => {
  const p=segments(params);
  try {
    const s=await session(request,env); if(!s) return out({error:"Unauthorized"},401);
    if(p[0]==="media" && p[1]) {
      const m=await env.DB.prepare("SELECT r2_key AS r2Key,content_type AS contentType FROM planner_media WHERE id=? AND workspace_id=?").bind(p[1],s.workspaceId).first<{r2Key:string;contentType:string}>();
      if(!m) return new Response("Not found",{status:404});
      const object=await env.MEDIA.get(m.r2Key); if(!object) return new Response("Not found",{status:404});
      const h=new Headers(); object.writeHttpMetadata(h); h.set("Content-Type",m.contentType); h.set("X-Content-Type-Options","nosniff"); h.set("Cache-Control","private, no-store");
      return new Response(object.body,{headers:h});
    }
    if(p[0]==="me" || p[0]==="workspace") {
      const w=await env.DB.prepare("SELECT id,slug,name,logo_url AS logoUrl,primary_color AS primaryColor,custom_domain AS customDomain FROM planner_workspaces WHERE id=?").bind(s.workspaceId).first();
      return p[0]==="me" ? out({user:{id:s.userId,email:s.email,name:s.name,role:s.role,clientId:s.clientId},workspace:w}) : out({workspace:w});
    }
    if(p[0]==="clients") {
      const r=s.role==="client"
        ? await env.DB.prepare("SELECT id,name,industry,contact_email AS contactEmail,notes FROM planner_clients WHERE id=? AND workspace_id=?").bind(s.clientId,s.workspaceId).all()
        : await env.DB.prepare("SELECT id,name,industry,contact_email AS contactEmail,notes FROM planner_clients WHERE workspace_id=? ORDER BY created_at DESC").bind(s.workspaceId).all();
      return out({clients:r.results||[]});
    }
    if(p[0]==="members" && allowed(s,["owner","admin"])) {
      const r=await env.DB.prepare("SELECT id,client_id AS clientId,email,name,role,is_active AS isActive FROM planner_users WHERE workspace_id=? ORDER BY created_at DESC").bind(s.workspaceId).all();
      const pending=await env.DB.prepare("SELECT email,name,role,expires_at AS expiresAt,created_at AS createdAt FROM planner_invitations WHERE workspace_id=? AND accepted_at IS NULL AND expires_at>? ORDER BY created_at DESC").bind(s.workspaceId,now()).all();
      return out({members:r.results||[],invitations:pending.results||[]});
    }
    if(p[0]==="posts" || p[0]==="approvals") {
      let q="SELECT p.id,p.client_id AS clientId,c.name AS clientName,p.title,p.caption,p.platform,p.format,p.publish_at AS publishAt,p.status,p.client_feedback AS clientFeedback FROM planner_posts p JOIN planner_clients c ON c.id=p.client_id AND c.workspace_id=p.workspace_id WHERE p.workspace_id=?";
      const args: unknown[]=[s.workspaceId];
      if(s.role==="client"){q+=" AND p.client_id=?";args.push(s.clientId);}
      if(p[0]==="approvals") q+=" AND p.status='in_review'";
      const status=new URL(request.url).searchParams.get("status");
      if(status && ["draft","planned","in_review","approved","changes_requested","published"].includes(status)){q+=" AND p.status=?";args.push(status);}
      q+=" ORDER BY p.publish_at ASC,p.created_at DESC";
      const r=await env.DB.prepare(q).bind(...args).all(); return out({posts:r.results||[]});
    }
    return out({error:"Not found"},404);
  } catch { return out({error:"Planner service unavailable"},503); }
};

export const onRequestPost: PagesFunction<Env> = async ({request,env,params}) => {
  if(!sameOrigin(request)) return out({error:"Invalid origin"},403);
  const p=segments(params);
  try {
    if(p[0]==="bootstrap") {
      if(!(await platformAdmin(request,env))) return out({error:"Platform admin required"},401);
      const b=await body<{workspaceName?:string;workspaceSlug?:string;ownerEmail?:string;ownerName?:string;ownerPassword?:string}>(request);
      if(!b) return out({error:"Invalid JSON"},400);
      const name=String(b.workspaceName||"").trim().slice(0,100), slug=slugify(String(b.workspaceSlug||b.workspaceName||""));
      const email=String(b.ownerEmail||"").trim().toLowerCase(), owner=String(b.ownerName||"").trim().slice(0,100), pass=String(b.ownerPassword||"");
      if(!name||!slug||!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)||!owner||pass.length<12||pass.length>256) return out({error:"Workspace, valid owner email, owner name and password (12+ characters) are required"},400);
      const wid=id(),uid=id(),salt=hex();
      try {
        await env.DB.prepare("INSERT INTO planner_workspaces(id,slug,name) VALUES(?,?,?)").bind(wid,slug,name).run();
        await env.DB.prepare("INSERT INTO planner_users(id,workspace_id,email,name,role,password_hash,password_salt) VALUES(?,?,?,?,'owner',?,?)").bind(uid,wid,email,owner,await hashPassword(pass,salt),salt).run();
      } catch {
        await env.DB.prepare("DELETE FROM planner_workspaces WHERE id=?").bind(wid).run().catch(()=>undefined);
        return out({error:"Workspace already exists or planner migration has not been applied"},409);
      }
      return out({ok:true,workspace:{id:wid,slug,name},owner:{id:uid,email,name:owner,role:"owner"}},201);
    }
    if(p[0]==="auth"&&p[1]==="accept-invite") {
      const b=await body<{token?:string;password?:string}>(request);
      const token=String(b?.token||""),pass=String(b?.password||"");
      if(!/^[a-f0-9]{64}$/.test(token)||pass.length<12||pass.length>256) return out({error:"A valid invitation and password of at least 12 characters are required"},400);
      const inv=await env.DB.prepare("SELECT token_hash AS tokenHash,workspace_id AS workspaceId,email,name,role,client_id AS clientId,expires_at AS expiresAt,accepted_at AS acceptedAt FROM planner_invitations WHERE token_hash=?").bind(await digest(token)).first<any>();
      if(!inv||inv.acceptedAt||inv.expiresAt<=now()) return out({error:"This invitation is invalid, expired or already used"},410);
      const existing=await env.DB.prepare("SELECT id FROM planner_users WHERE workspace_id=? AND email=?").bind(inv.workspaceId,inv.email).first();
      if(existing) return out({error:"An account with this email already exists in this workspace"},409);
      const uid=id(),salt=hex(),passwordHashValue=await hashPassword(pass,salt);
      try {
        await env.DB.prepare("INSERT INTO planner_users(id,workspace_id,client_id,email,name,role,password_hash,password_salt) VALUES(?,?,?,?,?,?,?,?)").bind(uid,inv.workspaceId,inv.clientId,inv.email,inv.name,inv.role,passwordHashValue,salt).run();
        const updated=await env.DB.prepare("UPDATE planner_invitations SET accepted_at=? WHERE token_hash=? AND accepted_at IS NULL AND expires_at>?").bind(now(),inv.tokenHash,now()).run();
        if(!updated.meta.changes) {
          await env.DB.prepare("DELETE FROM planner_users WHERE id=?").bind(uid).run();
          return out({error:"This invitation has expired or has already been used"},410);
        }
      } catch { return out({error:"Could not accept invitation. Check whether this email already has an account."},409); }
      const loginToken=await issueSession(env,{id:uid,workspace_id:inv.workspaceId});
      return out({ok:true,workspaceSlug: (await env.DB.prepare("SELECT slug FROM planner_workspaces WHERE id=?").bind(inv.workspaceId).first<{slug:string}>())?.slug},200,{"Set-Cookie":cookieHeader(loginToken,43200)});
    }
    if(p[0]==="auth"&&p[1]==="login") {
      const b=await body<{workspaceSlug?:string;email?:string;password?:string}>(request); if(!b) return out({error:"Invalid JSON"},400);
      const slug=slugify(String(b.workspaceSlug||"")),email=String(b.email||"").trim().toLowerCase(),pass=String(b.password||"");
      if(!slug||!email||!pass||pass.length>256) return out({error:"Workspace, email and password are required"},400);
      const key=await digest(slug+":"+email),t=now();
      const attempt=await env.DB.prepare("SELECT attempts,window_started_at AS started FROM planner_login_attempts WHERE attempt_key=?").bind(key).first<{attempts:number;started:number}>();
      if(attempt&&attempt.started>t-900&&attempt.attempts>=8) return out({error:"Too many attempts. Try again in 15 minutes."},429);
      await env.DB.prepare("INSERT INTO planner_login_attempts(attempt_key,attempts,window_started_at) VALUES(?,?,?) ON CONFLICT(attempt_key) DO UPDATE SET attempts=CASE WHEN window_started_at<=? THEN 1 ELSE attempts+1 END,window_started_at=CASE WHEN window_started_at<=? THEN excluded.window_started_at ELSE window_started_at END").bind(key,1,t,t-900,t-900).run();
      const u=await env.DB.prepare("SELECT u.id,u.workspace_id,u.password_hash AS passwordHash,u.password_salt AS passwordSalt,u.is_active AS isActive FROM planner_users u JOIN planner_workspaces w ON w.id=u.workspace_id WHERE w.slug=? AND u.email=?").bind(slug,email).first<any>();
      const valid=u&&u.isActive&&equal(await hashPassword(pass,u.passwordSalt),u.passwordHash);
      if(!valid) return out({error:"Invalid workspace, email or password"},401);
      await env.DB.prepare("DELETE FROM planner_login_attempts WHERE attempt_key=?").bind(key).run();
      return out({ok:true},200,{"Set-Cookie":cookieHeader(await issueSession(env,u),43200)});
    }
    if(p[0]==="auth"&&p[1]==="logout") {
      const token=cookie(request,"modo_planner_session"); if(token) await env.DB.prepare("DELETE FROM planner_sessions WHERE token_hash=?").bind(await digest(token)).run();
      return out({ok:true},200,{"Set-Cookie":cookieHeader("",0)});
    }
    const s=await session(request,env); if(!s) return out({error:"Unauthorized"},401);
    if(p[0]==="clients") {
      if(!allowed(s,["owner","admin","staff"])) return out({error:"Forbidden"},403);
      const b=await body<{name?:string;industry?:string;contactEmail?:string;notes?:string}>(request);
      const name=String(b?.name||"").trim(); if(!name) return out({error:"Client name is required"},400);
      const cid=id();
      await env.DB.prepare("INSERT INTO planner_clients(id,workspace_id,name,industry,contact_email,notes) VALUES(?,?,?,?,?,?)").bind(cid,s.workspaceId,name.slice(0,120),String(b?.industry||"").slice(0,100),String(b?.contactEmail||"").trim().slice(0,160),String(b?.notes||"").slice(0,4000)).run();
      return out({ok:true,client:{id:cid,name}},201);
    }
    if(p[0]==="members"&&p[1]==="invite") {
      if(!allowed(s,["owner","admin"])) return out({error:"Forbidden"},403);
      const b=await body<{email?:string;name?:string;role?:Role;clientId?:string|null}>(request);
      const email=String(b?.email||"").trim().toLowerCase(),name=String(b?.name||"").trim().slice(0,100),role=b?.role,clientId=b?.clientId||null;
      if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)||!name||!["admin","staff","client"].includes(String(role))) return out({error:"Valid email, name and role are required"},400);
      if(role==="client"&&!clientId) return out({error:"Client users must be linked to a client"},400);
      if(clientId&&!await env.DB.prepare("SELECT id FROM planner_clients WHERE id=? AND workspace_id=?").bind(clientId,s.workspaceId).first()) return out({error:"Client not found"},404);
      if(await env.DB.prepare("SELECT id FROM planner_users WHERE workspace_id=? AND email=?").bind(s.workspaceId,email).first()) return out({error:"This email already belongs to a workspace member"},409);
      await env.DB.prepare("DELETE FROM planner_invitations WHERE workspace_id=? AND email=? AND accepted_at IS NULL").bind(s.workspaceId,email).run();
      const token=hex(32),expires=now()+7*86400;
      await env.DB.prepare("INSERT INTO planner_invitations(token_hash,workspace_id,email,name,role,client_id,invited_by,expires_at,created_at) VALUES(?,?,?,?,?,?,?,?,?)").bind(await digest(token),s.workspaceId,email,name,role,clientId,s.userId,expires,now()).run();
      const inviteUrl=new URL("/planner/invite/"+token,request.url).toString();
      return out({ok:true,invitation:{email,name,role,expiresAt:expires,inviteUrl}},201);
    }

      const b=await body<{email?:string;name?:string;role?:Role;password?:string;clientId?:string}>(request);
      const email=String(b?.email||"").trim().toLowerCase(),name=String(b?.name||"").trim(),role=b?.role,pass=String(b?.password||""),clientId=b?.clientId||null;
      if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)||!name||!["admin","staff","client"].includes(String(role))||pass.length<12||pass.length>256) return out({error:"Valid email, name, role and 12+ character password are required"},400);
      if(role==="client"&&!clientId) return out({error:"Client users must be linked to a client"},400);
      if(clientId&&!await env.DB.prepare("SELECT id FROM planner_clients WHERE id=? AND workspace_id=?").bind(clientId,s.workspaceId).first()) return out({error:"Client not found"},404);
      const uid=id(),salt=hex();
      try { await env.DB.prepare("INSERT INTO planner_users(id,workspace_id,client_id,email,name,role,password_hash,password_salt) VALUES(?,?,?,?,?,?,?,?)").bind(uid,s.workspaceId,clientId,email,name.slice(0,100),role,await hashPassword(pass,salt),salt).run(); }
      catch { return out({error:"Member email already exists in this workspace"},409); }
      return out({ok:true,member:{id:uid,email,name,role,clientId}},201);
    }
    if(p[0]==="posts"&&p.length===1) {
      if(!allowed(s,["owner","admin","staff"])) return out({error:"Forbidden"},403);
      const b=await body<{clientId?:string;title?:string;caption?:string;platform?:string;format?:string;publishAt?:string|null}>(request);
      const title=String(b?.title||"").trim(),clientId=String(b?.clientId||"");
      if(!title||title.length>200||!clientId) return out({error:"Client and title are required"},400);
      if(!await env.DB.prepare("SELECT id FROM planner_clients WHERE id=? AND workspace_id=?").bind(clientId,s.workspaceId).first()) return out({error:"Client not found"},404);
      const pid=id();
      await env.DB.prepare("INSERT INTO planner_posts(id,workspace_id,client_id,title,caption,platform,format,publish_at,created_by) VALUES(?,?,?,?,?,?,?,?,?)").bind(pid,s.workspaceId,clientId,title,String(b?.caption||"").slice(0,20000),String(b?.platform||"Facebook").slice(0,40),String(b?.format||"Single image").slice(0,40),b?.publishAt||null,s.userId).run();
      return out({ok:true,post:await postById(env,s,pid)},201);
    }
    if(p[0]==="posts"&&p[1]&&p[2]==="submit") {
      if(!allowed(s,["owner","admin","staff"])) return out({error:"Forbidden"},403);
      const post=await postById(env,s,p[1]); if(!post) return out({error:"Post not found"},404);
      if(!["draft","planned","changes_requested"].includes(post.status)) return out({error:"Post cannot be submitted"},409);
      await env.DB.prepare("UPDATE planner_posts SET status='in_review',updated_at=datetime('now') WHERE id=? AND workspace_id=?").bind(p[1],s.workspaceId).run();
      await env.DB.prepare("INSERT INTO planner_approval_events(id,workspace_id,post_id,actor_user_id,action) VALUES(?,?,?,?,'submitted')").bind(id(),s.workspaceId,p[1],s.userId).run();
      return out({ok:true,post:await postById(env,s,p[1])});
    }
    if(p[0]==="posts"&&p[1]&&p[2]==="decision") {
      if(!allowed(s,["client","owner","admin"])) return out({error:"Forbidden"},403);
      const post=await postById(env,s,p[1]); if(!post||(s.role==="client"&&post.clientId!==s.clientId)) return out({error:"Post not found"},404);
      if(post.status!=="in_review") return out({error:"Post is not awaiting approval"},409);
      const b=await body<{action?:string;comment?:string}>(request);
      if(!b||!["approved","changes_requested"].includes(String(b.action))) return out({error:"Choose approved or changes_requested"},400);
      const comment=String(b.comment||"").slice(0,4000);
      await env.DB.prepare("UPDATE planner_posts SET status=?,client_feedback=?,approved_by=?,approved_at=CASE WHEN ?='approved' THEN datetime('now') ELSE NULL END,updated_at=datetime('now') WHERE id=? AND workspace_id=?").bind(b.action,comment,s.userId,b.action,p[1],s.workspaceId).run();
      await env.DB.prepare("INSERT INTO planner_approval_events(id,workspace_id,post_id,actor_user_id,action,comment) VALUES(?,?,?,?,?,?)").bind(id(),s.workspaceId,p[1],s.userId,b.action,comment).run();
      return out({ok:true,post:await postById(env,s,p[1])});
    }
    if(p[0]==="media") {
      if(!allowed(s,["owner","admin","staff"])) return out({error:"Forbidden"},403);
      const form=await request.formData().catch(()=>null);
      if(!form) return out({error:"Invalid multipart form"},400);
      const file=form.get("file");
      if(!(file instanceof File)) return out({error:"Image file required"},400);
      const types:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/avif":"avif"};
      const ext=types[file.type]; if(!ext) return out({error:"Only JPG, PNG, WebP and AVIF images are supported"},415);
      if(file.size<1||file.size>10*1024*1024) return out({error:"Image must be smaller than 10 MB"},413);
      const clientId=String(form.get("clientId")||"")||null;
      if(clientId&&!await env.DB.prepare("SELECT id FROM planner_clients WHERE id=? AND workspace_id=?").bind(clientId,s.workspaceId).first()) return out({error:"Client not found"},404);
      const mid=id(),key=`planner/${s.workspaceId}/${mid}.${ext}`;
      await env.MEDIA.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:file.type,cacheControl:"private, no-store"}});
      try {
        await env.DB.prepare("INSERT INTO planner_media(id,workspace_id,client_id,r2_key,filename,content_type,size_bytes,uploaded_by) VALUES(?,?,?,?,?,?,?,?)").bind(mid,s.workspaceId,clientId,key,file.name.slice(0,200),file.type,file.size,s.userId).run();
      } catch(e) { return out({error:"Media metadata could not be saved"},503); }
      return out({ok:true,media:{id:mid,filename:file.name,contentType:file.type,sizeBytes:file.size,url:`/api/planner/media/${mid}`}},201);
    }
    return out({error:"Not found"},404);
  } catch { return out({error:"Planner service unavailable"},503); }
};

export const onRequestPut: PagesFunction<Env> = async ({request,env,params}) => {
  if(!sameOrigin(request)) return out({error:"Invalid origin"},403);
  const p=segments(params),s=await session(request,env).catch(()=>null);
  if(!s) return out({error:"Unauthorized"},401);
  if(p[0]==="posts"&&p[1]&&allowed(s,["owner","admin","staff"])) {
    const b=await body<{title?:string;caption?:string;platform?:string;format?:string;publishAt?:string|null;status?:string}>(request);
    const current=await postById(env,s,p[1]); if(!current) return out({error:"Post not found"},404);
    const title=String(b?.title??current.title).trim();
    if(!title||title.length>200) return out({error:"Invalid title"},400);
    const status=b?.status&&["draft","planned"].includes(b.status)?b.status:current.status;
    await env.DB.prepare("UPDATE planner_posts SET title=?,caption=?,platform=?,format=?,publish_at=?,status=?,updated_at=datetime('now') WHERE id=? AND workspace_id=?")
      .bind(title,b?.caption===undefined?current.caption:String(b.caption).slice(0,20000),b?.platform===undefined?current.platform:String(b.platform).slice(0,40),b?.format===undefined?current.format:String(b.format).slice(0,40),b?.publishAt===undefined?current.publishAt:b.publishAt,status,p[1],s.workspaceId).run();
    return out({ok:true,post:await postById(env,s,p[1])});
  }
  if(p[0]!=="workspace"||!allowed(s,["owner","admin"])) return out({error:"Forbidden"},403);
  const b=await body<{name?:string;logoUrl?:string|null;primaryColor?:string;customDomain?:string|null}>(request);
  if(!b) return out({error:"Invalid JSON"},400);
  const current=await env.DB.prepare("SELECT name,logo_url AS logoUrl,primary_color AS primaryColor,custom_domain AS customDomain FROM planner_workspaces WHERE id=?").bind(s.workspaceId).first<any>();
  const name=String(b.name??current?.name??"").trim().slice(0,100),color=String(b.primaryColor??current?.primaryColor??"#dfe52f");
  if(!name||!/^#[0-9a-fA-F]{6}$/.test(color)) return out({error:"Invalid workspace name or brand color"},400);
  try {
    await env.DB.prepare("UPDATE planner_workspaces SET name=?,logo_url=?,primary_color=?,custom_domain=?,updated_at=datetime('now') WHERE id=?").bind(name,b.logoUrl===undefined?current?.logoUrl??null:b.logoUrl,color,b.customDomain===undefined?current?.customDomain??null:b.customDomain,s.workspaceId).run();
    return out({ok:true});
  } catch { return out({error:"Workspace update failed"},409); }
};
