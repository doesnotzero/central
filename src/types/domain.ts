export type PlanId = "trial" | "solo" | "pro" | "studio" | "white_label" | "admin";

export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  plan: PlanId;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
}
