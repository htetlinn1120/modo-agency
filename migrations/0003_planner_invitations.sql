-- Team invitation lifecycle for MODO Planner.
CREATE TABLE IF NOT EXISTS planner_invitations (
  token_hash TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES planner_workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','staff','client')),
  client_id TEXT,
  invited_by TEXT NOT NULL REFERENCES planner_users(id),
  expires_at INTEGER NOT NULL,
  accepted_at INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (client_id, workspace_id) REFERENCES planner_clients(id, workspace_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS planner_invitations_workspace_idx ON planner_invitations(workspace_id, created_at);
CREATE INDEX IF NOT EXISTS planner_invitations_expiry_idx ON planner_invitations(expires_at);
