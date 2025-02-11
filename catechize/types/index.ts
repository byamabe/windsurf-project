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
  podcast_id: string
  title: string
  description: string
  audio_url: string
  video_url?: string
  duration: number
  published_at: string
  transcript?: string
  loci_ids: string[]
  question_ids: string[]
  is_premium: boolean
  created_at: string
  updated_at: string
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
