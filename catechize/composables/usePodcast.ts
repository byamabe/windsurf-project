import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { Podcast } from '~/types/database'

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

export const usePodcast = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const fetchPodcasts = async (): Promise<Podcast[]> => {
    const { data: podcasts, error } = await supabase
      .from('podcasts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return podcasts
  }

  const fetchPodcast = async (id: string): Promise<Podcast> => {
    const { data: podcast, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return podcast
  }

  const createPodcast = async (podcast: Omit<Podcast, 'id' | 'created_at' | 'updated_at' | 'episode_count'>): Promise<Podcast> => {
    if (!user.value) throw new Error('User must be logged in to create a podcast')

    const { data, error } = await supabase
      .from('podcasts')
      .insert({
        ...podcast,
        author_id: user.value.id,
        status: 'draft'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const updatePodcast = async (id: string, updates: Partial<Omit<Podcast, 'id' | 'created_at' | 'updated_at' | 'episode_count'>>): Promise<Podcast> => {
    const { data, error } = await supabase
      .from('podcasts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const deletePodcast = async (id: string): Promise<void> => {
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

export type { Podcast }
