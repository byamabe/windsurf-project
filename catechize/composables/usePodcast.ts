import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { Database } from '~/types/supabase'

export interface BasePodcast {
  id: string
  title: string
  description: string | null
  slug: string
  cover_image_url: string | null
  rss_feed_url: string | null
  website_url: string | null
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
}

export interface Podcast extends BasePodcast {
  episode_count: number
}

export const usePodcast = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  const fetchPodcasts = async () => {
    const { data: podcasts, error } = await supabase
      .from('podcasts')
      .select(`
        *,
        episodes!inner (count)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Transform the response to match our interface
    return podcasts.map(podcast => ({
      ...podcast,
      episode_count: podcast.episodes[0].count || 0
    }))
  }

  const fetchPodcast = async (id: string) => {
    const { data: podcast, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return podcast
  }

  const createPodcast = async (podcast: Omit<BasePodcast, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('Creating podcast:', podcast)
    if (!user.value) throw new Error('User must be logged in to create a podcast')

    const { data, error } = await supabase
      .from('podcasts')
      .insert({
        ...podcast,
        author_id: user.value.id
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(error.message)
    }
    
    console.log('Created podcast:', data)
    return data
  }

  const updatePodcast = async (id: string, updates: Partial<Omit<BasePodcast, 'id' | 'created_at' | 'updated_at'>>) => {
    const { data, error } = await supabase
      .from('podcasts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const deletePodcast = async (id: string) => {
    const { error } = await supabase
      .from('podcasts')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  return {
    fetchPodcasts,
    fetchPodcast,
    createPodcast,
    updatePodcast,
    deletePodcast
  }
}
