export interface Podcast {
  id: string
  created_at: string
  title: string
  description: string | null
  cover_image_url: string | null
  author_id: string
  published: boolean
  updated_at: string
  slug: string
  rss_feed_url: string | null
  website_url: string | null
  status: 'draft' | 'published' | 'archived'
  episode_count?: number
}

export interface Episode {
  id: string
  created_at: string
  title: string
  description: string | null
  audio_url: string | null
  podcast_id: string
  author_id: string
  published: boolean
  duration: number | null
  transcript: string | null
  updated_at: string
  slug: string
  video_url: string | null
  published_at: string | null
  status: 'draft' | 'published' | 'archived'
  is_premium: boolean
}

export interface User {
  id: string
  email: string | null
  created_at: string
  updated_at: string
  username: string | null
  avatar_url: string | null
}

export interface Database {
  public: {
    Tables: {
      podcasts: {
        Row: Podcast
        Insert: Omit<Podcast, 'id' | 'created_at' | 'updated_at' | 'episode_count'>
        Update: Partial<Omit<Podcast, 'id' | 'created_at' | 'updated_at' | 'episode_count'>>
      }
      episodes: {
        Row: Episode
        Insert: Omit<Episode, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Episode, 'id' | 'created_at' | 'updated_at'>>
      }
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
