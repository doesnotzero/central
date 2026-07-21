import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../config/app';
import type { AppState } from '../types/app';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function getWorkspaceState(workspaceId: string) {
  const { data, error } = await supabase
    .from('workspaces')
    .select('state')
    .eq('id', workspaceId)
    .single();
  
  return { state: data?.state || {}, error };
}

export async function saveWorkspaceState(workspaceId: string, state: AppState) {
  const { error } = await supabase
    .from('workspaces')
    .update({ 
      state,
      updated_at: new Date().toISOString()
    })
    .eq('id', workspaceId);
  
  return { error };
}

export async function getWorkspaceBranding(workspaceId: string) {
  const { data, error } = await supabase
    .from('workspaces')
    .select('branding_config')
    .eq('id', workspaceId)
    .single();
  
  return { branding: data?.branding_config || {}, error };
}

export async function getWorkspaceBusinessConfig(workspaceId: string) {
  const { data, error } = await supabase
    .from('workspaces')
    .select('business_config')
    .eq('id', workspaceId)
    .single();
  
  return { businessConfig: data?.business_config || {}, error };
}

export async function createWorkspace(name: string, slug: string, ownerId: string) {
  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      name,
      slug,
      owner_id: ownerId
    })
    .select()
    .single();
  
  return { workspace: data, error };
}

export async function getUserWorkspaces(userId: string) {
  const { data, error } = await supabase
    .from('workspace_members')
    .select(`
      workspace_id,
      role,
      workspaces (
        id,
        name,
        slug,
        branding_config,
        business_config
      )
    `)
    .eq('user_id', userId);
  
  return { workspaces: data, error };
}
