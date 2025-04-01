import { SupabaseClient } from '@supabase/supabase-js'
import { useSupabaseClient } from '#imports'

export type AnalyticsEventType = 
  | 'view'
  | 'play'
  | 'pause'
  | 'resume'
  | 'complete'
  | 'download'
  | 'share'
  | 'favorite'
  | 'playlist_add'

export interface AnalyticsEvent {
  id: string
  event_type: AnalyticsEventType
  episode_id?: string
  podcast_id?: string
  metadata?: Record<string, any>
  session_id?: string
  created_at: string
  user_id?: string
}

export interface EpisodeStats {
  episode_id: string
  total_views: number
  total_plays: number
  total_completions: number
  total_downloads: number
  total_shares: number
  total_favorites: number
  avg_completion_rate: number
  created_at: string
  updated_at: string
}

export interface PodcastStats {
  podcast_id: string
  total_views: number
  total_plays: number
  total_completions: number
  total_downloads: number
  total_shares: number
  total_favorites: number
  avg_completion_rate: number
  created_at: string
  updated_at: string
}

export const useAnalytics = () => {
  const supabase = useSupabaseClient()
  const sessionId = ref<string>(crypto.randomUUID())

  const trackEvent = async (event: Omit<AnalyticsEvent, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          ...event,
          session_id: event.session_id || sessionId.value
        })

      if (error) throw error
    } catch (error) {
      console.error('Error tracking analytics event:', error)
      throw error
    }
  }

  const getEpisodeStats = async (episodeId: string): Promise<EpisodeStats | null> => {
    try {
      const { data, error } = await supabase
        .from('episode_stats')
        .select('*')
        .eq('episode_id', episodeId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching episode stats:', error)
      throw error
    }
  }

  const getPodcastStats = async (podcastId: string): Promise<PodcastStats | null> => {
    try {
      const { data, error } = await supabase
        .from('podcast_stats')
        .select('*')
        .eq('podcast_id', podcastId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching podcast stats:', error)
      throw error
    }
  }

  const getEpisodeAnalytics = async (episodeId: string, startDate?: Date, endDate?: Date): Promise<AnalyticsEvent[]> => {
    try {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .eq('episode_id', episodeId)
        .order('created_at', { ascending: false })

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString())
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString())
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching episode analytics:', error)
      throw error
    }
  }

  const getPodcastAnalytics = async (podcastId: string, startDate?: Date, endDate?: Date): Promise<AnalyticsEvent[]> => {
    try {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .eq('podcast_id', podcastId)
        .order('created_at', { ascending: false })

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString())
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString())
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching podcast analytics:', error)
      throw error
    }
  }

  return {
    trackEvent,
    getEpisodeStats,
    getPodcastStats,
    getEpisodeAnalytics,
    getPodcastAnalytics
  }
}
