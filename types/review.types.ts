export type DeliverableStatus =
  | 'waiting_review'
  | 'revision_requested'
  | 'approved'

export type VideoSource = 'direct' | 'drive' | 'storage'

export interface Deliverable {
  id: string
  project_id: string
  title: string
  version: number
  video_url: string
  drive_file_id?: string
  drive_mime_type?: string
  video_source: VideoSource
  thumbnail_url?: string
  duration_seconds?: number
  review_token: string
  status: DeliverableStatus
  revision_round: number
  expires_at?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface VideoComment {
  id: string
  deliverable_id: string
  parent_id?: string
  timestamp_seconds?: number | null
  author_name: string
  author_email?: string
  author_type: 'client' | 'producer'
  content: string
  resolved: boolean
  resolved_by?: string
  resolved_at?: string
  created_at: string
  replies?: VideoComment[]
}

export interface ReviewPageData {
  deliverable: Deliverable
  project_title: string
  producer_name: string
  producer_logo?: string
  comments: VideoComment[]
}

export interface NewCommentPayload {
  deliverable_id: string
  timestamp_seconds?: number | null
  author_name: string
  author_email?: string
  author_type: 'client' | 'producer'
  content: string
  parent_id?: string
}

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  thumbnailLink?: string
  webViewLink?: string
  size?: string
  modifiedTime?: string
  videoMediaMetadata?: {
    width?: number
    height?: number
    durationMillis?: string
  }
}

export interface DrivePickerResult {
  fileId: string
  fileName: string
  mimeType: string
  thumbnailUrl?: string
  durationSeconds?: number
}
