import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { Database } from '~/types/supabase'

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

export const useEpisode = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  const fetchEpisodes = async (podcastId: string) => {
    const { data: episodes, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('podcast_id', podcastId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return episodes
  }

  const fetchEpisode = async (id: string) => {
    const { data: episode, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return episode
  }

  const createEpisode = async (episode: Omit<Episode, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user.value) throw new Error('User must be logged in to create an episode')

    const { data, error } = await supabase
      .from('episodes')
      .insert(episode)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const updateEpisode = async (id: string, updates: Partial<Omit<Episode, 'id' | 'created_at' | 'updated_at'>>) => {
    const { data, error } = await supabase
      .from('episodes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const deleteEpisode = async (id: string) => {
    const { error } = await supabase
      .from('episodes')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  return {
    fetchEpisodes,
    fetchEpisode,
    createEpisode,
    updateEpisode,
    deleteEpisode
  }
}
