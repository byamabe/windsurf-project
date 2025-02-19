import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { Episode } from '~/types/database'

export const useEpisode = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const fetchEpisodes = async (podcastId: string): Promise<Episode[]> => {
    const { data: episodes, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('podcast_id', podcastId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return episodes
  }

  const fetchEpisode = async (id: string): Promise<Episode> => {
    const { data: episode, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return episode
  }

  const createEpisode = async (episode: Omit<Episode, 'id' | 'created_at' | 'updated_at'>): Promise<Episode> => {
    if (!user.value) throw new Error('User must be logged in to create an episode')

    const { data, error } = await supabase
      .from('episodes')
      .insert({
        ...episode,
        author_id: user.value.id,
        status: 'draft',
        is_premium: false
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const updateEpisode = async (id: string, updates: Partial<Omit<Episode, 'id' | 'created_at' | 'updated_at'>>): Promise<Episode> => {
    const { data, error } = await supabase
      .from('episodes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const deleteEpisode = async (id: string): Promise<void> => {
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

export type { Episode }
