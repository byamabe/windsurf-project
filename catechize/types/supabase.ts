export interface Profile {
  id: string
  user_id: string
  display_name: string
  created_at: string
  updated_at: string
  avatar_url?: string | null
}

export interface Role {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Permission {
  id: string
  name: string
  description?: string
  created_at: string
}

export interface RolePermission {
  role_id: string
  permission_id: string
  created_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role_id: string
  created_at: string
  roles?: Role
}

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'institution'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled'

export interface UserSubscription {
  id: string
  user_id: string
  tier: SubscriptionTier
  starts_at: string
  ends_at?: string
  is_active: boolean
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

export interface Episode {
  id: string
  podcast_id: string
  title: string
  slug: string
  description: string | null
  audio_url: string | null
  video_url: string | null
  transcript: string | null
  duration: number | null
  published_at: string | null
  status: 'draft' | 'published' | 'archived'
  is_premium: boolean
  created_at: string
  updated_at: string
}

export interface Podcast {
  id: string
  title: string
  description: string | null
  slug: string
  cover_image_url: string | null
  rss_feed_url: string | null
  website_url: string | null
  status: 'draft' | 'published' | 'archived'
  author_id: string
  created_at: string
  updated_at: string
}

export type Tables = {
  profiles: Profile
  roles: Role
  permissions: Permission
  role_permissions: RolePermission
  user_roles: UserRole
  user_subscriptions: UserSubscription
  episodes: Episode
  podcasts: Podcast
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id'>>
      }
      roles: {
        Row: Role
        Insert: Omit<Role, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Role, 'id'>>
      }
      permissions: {
        Row: Permission
        Insert: Omit<Permission, 'id' | 'created_at'>
        Update: Partial<Omit<Permission, 'id'>>
      }
      role_permissions: {
        Row: RolePermission
        Insert: Omit<RolePermission, 'created_at'>
        Update: Partial<RolePermission>
      }
      user_roles: {
        Row: UserRole
        Insert: Omit<UserRole, 'id' | 'created_at'>
        Update: Partial<Omit<UserRole, 'id'>>
      }
      user_subscriptions: {
        Row: UserSubscription
        Insert: Omit<UserSubscription, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserSubscription, 'id'>>
      }
      episodes: {
        Row: Episode
        Insert: Omit<Episode, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Episode, 'id'>>
      }
      podcasts: {
        Row: Podcast
        Insert: Omit<Podcast, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Podcast, 'id'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: boolean
      is_subscription_active: boolean
      get_user_subscription_tier: {
        Args: { user_id: string }
        Returns: SubscriptionTier
      }
      get_user_permissions: {
        Args: { user_id: string }
        Returns: string[]
      }
      has_permission: {
        Args: { user_id: string; required_permission: string }
        Returns: boolean
      }
    }
    Enums: {
      subscription_tier: SubscriptionTier
      subscription_status: SubscriptionStatus
    }
  }
}
