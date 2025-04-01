import type { DatabaseEpisode } from './database'

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
  profile?: UserProfile
  subscription?: Subscription
}

export interface UserProfile {
  id: string
  user_id: string
  display_name: string
  bio?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'cancelled' | 'expired'
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

export interface Podcast {
  id: string
  title: string
  description: string
  cover_image_url: string
  rss_feed_url?: string
  website_url?: string
  author_ids: string[]
  created_at: string
  updated_at: string
}

export interface Episode {
  id: string
  podcastId: string
  title: string
  description: string | null
  audioUrl: string | null
  videoUrl?: string | null
  duration?: string
  publishedAt: string | null
  transcript?: string | null
  lociIds: string[]
  questionIds: string[]
  isPremium: boolean
  createdAt: string
  updatedAt: string
  authorId: string
  status: 'draft' | 'published' | 'archived'
}

export interface Author {
  id: string
  name: string
  bio?: string
  avatar_url?: string
  website_url?: string
  created_at: string
  updated_at: string
}

export interface Locus {
  id: string
  name: string
  description: string
  parent_id?: string
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  text: string
  answer?: string
  loci_ids: string[]
  created_at: string
  updated_at: string
}

export interface Playlist {
  id: string
  user_id: string
  title: string
  description?: string
  episode_ids: string[]
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Rating {
  id: string
  user_id: string
  episode_id: string
  score: number
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  user_id: string
  episode_id: string
  content: string
  parent_id?: string
  created_at: string
  updated_at: string
}

export function toFrontendEpisode(db: DatabaseEpisode): Episode {
  return {
    id: db.id,
    podcastId: db.podcast_id,
    title: db.title,
    description: db.description,
    audioUrl: db.audio_url,
    videoUrl: db.video_url,
    duration: db.duration,
    publishedAt: db.published_at,
    transcript: db.transcript,
    lociIds: [], // These need to be loaded separately
    questionIds: [], // These need to be loaded separately
    isPremium: db.is_premium,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    authorId: db.author_id,
    status: db.status
  }
}

export function toDatabaseEpisode(fe: Partial<Episode>): Partial<DatabaseEpisode> {
  return {
    id: fe.id,
    podcast_id: fe.podcastId,
    title: fe.title,
    description: fe.description,
    audio_url: fe.audioUrl,
    video_url: fe.videoUrl,
    duration: fe.duration,
    published_at: fe.publishedAt,
    transcript: fe.transcript,
    is_premium: fe.isPremium,
    created_at: fe.createdAt,
    updated_at: fe.updatedAt,
    author_id: fe.authorId,
    status: fe.status
  }
}
