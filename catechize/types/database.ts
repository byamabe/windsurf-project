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

// Database schema types - these match exactly what's in the database
export interface DatabaseEpisode {
  id: string
  created_at: string
  updated_at: string
  title: string
  description: string | null
  audio_url: string | null
  video_url: string | null
  podcast_id: string
  author_id: string
  published: boolean
  duration?: string
  transcript: string | null
  slug: string
  published_at: string | null
  is_premium: boolean
  status: 'draft' | 'published' | 'archived'
}

// Re-export for backward compatibility
export type { DatabaseEpisode as Episode }

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
        Row: DatabaseEpisode
        Insert: Omit<DatabaseEpisode, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<DatabaseEpisode, 'id' | 'created_at' | 'updated_at'>>
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
