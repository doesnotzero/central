import { getSupabase } from "./supabaseClient.js";

const DELIVERABLE_COLUMNS = [
  "id",
  "project_id",
  "title",
  "version",
  "video_url",
  "public_url",
  "drive_file_id",
  "video_source",
  "thumbnail_url",
  "duration_seconds",
  "review_token",
  "status",
  "revision_round",
  "expires_at",
  "created_by",
  "created_at",
  "updated_at"
].join(",");

const COMMENT_COLUMNS = [
  "id",
  "deliverable_id",
  "parent_id",
  "timestamp_seconds",
  "timecode",
  "author_name",
  "author_email",
  "author_type",
  "content",
  "resolved",
  "resolved_at",
  "created_at"
].join(",");

const buildCommentTree = comments => {
  const byId = new Map(comments.map(comment => [comment.id, { ...comment, replies: [] }]));
  const roots = [];

  byId.forEach(comment => {
    if (comment.parent_id && byId.has(comment.parent_id)) {
      byId.get(comment.parent_id).replies.push(comment);
    } else {
      roots.push(comment);
    }
  });

  return roots.sort((a, b) => Number(a.timestamp_seconds || 0) - Number(b.timestamp_seconds || 0));
};

export const getDeliverableByToken = async token => {
  const supabase = getSupabase();
  if (!supabase || !token) return null;

  const { data, error } = await supabase
    .from("deliverables")
    .select(DELIVERABLE_COLUMNS)
    .eq("review_token", token)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return { ...data, expired: true };

  return data;
};

export const getCommentsByDeliverable = async deliverableId => {
  const supabase = getSupabase();
  if (!supabase || !deliverableId) return [];

  const { data, error } = await supabase
    .from("video_comments")
    .select(COMMENT_COLUMNS)
    .eq("deliverable_id", deliverableId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return buildCommentTree(data);
};

export const createVideoComment = async payload => {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error("Supabase indisponível") };

  const { data, error } = await supabase
    .from("video_comments")
    .insert(payload)
    .select(COMMENT_COLUMNS)
    .single();

  return { data, error };
};

export const updateDeliverableStatus = async (deliverableId, status) => {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error("Supabase indisponível") };

  const { data, error } = await supabase
    .from("deliverables")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", deliverableId)
    .select(DELIVERABLE_COLUMNS)
    .single();

  return { data, error };
};

export const createDeliverable = async payload => {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error("Supabase indisponível") };

  const { data, error } = await supabase
    .from("deliverables")
    .insert(payload)
    .select(DELIVERABLE_COLUMNS)
    .single();

  return { data, error };
};
