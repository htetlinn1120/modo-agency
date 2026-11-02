-- MODO Planner SaaS foundation. Separate from the existing public-site CMS tables.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS planner_workspaces (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#dfe52f',
  custom_domain TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS planner_users (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES planner_workspaces(id) ON DELETE CASCADE,
  client_id TEXT,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'staff', 'client')),
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (workspace_id, email),
  UNIQUE (id, workspace_id)
);

CREATE TABLE IF NOT EXISTS planner_sessions (
  token_hash TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id, workspace_id) REFERENCES planner_users(id, workspace_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS planner_clients (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES planner_workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (id, workspace_id)
);

CREATE TABLE IF NOT EXISTS planner_posts (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES planner_workspaces(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  title TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  platform TEXT NOT NULL DEFAULT 'Facebook',
  format TEXT NOT NULL DEFAULT 'Single image',
  publish_at TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'planned', 'in_review', 'approved', 'changes_requested', 'published')),
  created_by TEXT NOT NULL REFERENCES planner_users(id),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  approved_by TEXT,
  approved_at TEXT,
  client_feedback TEXT NOT NULL DEFAULT '',
  FOREIGN KEY (client_id, workspace_id) REFERENCES planner_clients(id, workspace_id) ON DELETE CASCADE,
  UNIQUE (id, workspace_id)
);

CREATE TABLE IF NOT EXISTS planner_media (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES planner_workspaces(id) ON DELETE CASCADE,
  client_id TEXT,
  r2_key TEXT NOT NULL UNIQUE,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  uploaded_by TEXT NOT NULL REFERENCES planner_users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (client_id, workspace_id) REFERENCES planner_clients(id, workspace_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS planner_approval_events (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES planner_workspaces(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL,
  actor_user_id TEXT NOT NULL REFERENCES planner_users(id),
  action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'changes_requested')),
  comment TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (post_id, workspace_id) REFERENCES planner_posts(id, workspace_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS planner_login_attempts (
  attempt_key TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  window_started_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS planner_users_workspace_idx ON planner_users(workspace_id, role);
CREATE INDEX IF NOT EXISTS planner_sessions_expiry_idx ON planner_sessions(expires_at);
CREATE INDEX IF NOT EXISTS planner_clients_workspace_idx ON planner_clients(workspace_id, created_at);
CREATE INDEX IF NOT EXISTS planner_posts_workspace_date_idx ON planner_posts(workspace_id, publish_at);
CREATE INDEX IF NOT EXISTS planner_posts_client_status_idx ON planner_posts(workspace_id, client_id, status);
CREATE INDEX IF NOT EXISTS planner_media_workspace_idx ON planner_media(workspace_id, client_id);
CREATE INDEX IF NOT EXISTS planner_approval_post_idx ON planner_approval_events(workspace_id, post_id, created_at);
