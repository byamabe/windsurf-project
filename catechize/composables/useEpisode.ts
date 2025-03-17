import { useSupabaseClient, useSupabaseUser } from '#imports'

export interface Episode {
  id: string
  title: string
  description: string | null
  audioUrl: string | null
  imageUrl?: string | null
  videoUrl?: string | null
  publishedAt?: string | null
  isPremium?: boolean
  podcastId: string
  status: 'draft' | 'published' | 'archived'
  authorId?: string
  transcript?: string | null
  slug?: string
  createdAt?: string
  updatedAt?: string
}

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
    console.log('Fetching episode:', id)
    const { data: episode, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', id)
      .single()

    console.log('Supabase response:', { episode, error })
    
    // Convert snake_case to camelCase
    if (episode) {
      episode.audioUrl = episode.audio_url
      episode.videoUrl = episode.video_url
      episode.imageUrl = episode.image_url
      episode.publishedAt = episode.published_at
      episode.podcastId = episode.podcast_id
      episode.authorId = episode.author_id
      episode.createdAt = episode.created_at
      episode.updatedAt = episode.updated_at
      episode.isPremium = episode.is_premium
    }

    if (error) throw error
    return episode
  }

  const createEpisode = async (episode: Omit<Episode, 'id' | 'created_at' | 'updated_at'>): Promise<Episode> => {
    if (!user.value) throw new Error('User must be logged in to create an episode')

    // Convert camelCase to snake_case for Supabase
    const dbEpisode = {
      title: episode.title,
      description: episode.description,
      audio_url: episode.audioUrl,
      video_url: episode.videoUrl,
      image_url: episode.imageUrl,
      published_at: episode.publishedAt,
      is_premium: episode.isPremium ?? false,
      podcast_id: episode.podcastId,
      status: episode.status || 'draft',
      author_id: user.value.id,
      transcript: episode.transcript,
      slug: episode.slug
    }

    const { data, error } = await supabase
      .from('episodes')
      .insert(dbEpisode)
      .select()
      .single()

    if (error) throw error

    // Convert snake_case back to camelCase for frontend
    return {
      ...data,
      audioUrl: data.audio_url,
      videoUrl: data.video_url,
      imageUrl: data.image_url,
      publishedAt: data.published_at,
      podcastId: data.podcast_id,
      authorId: data.author_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isPremium: data.is_premium
    }
  }

  const updateEpisode = async (id: string, episode: Partial<Omit<Episode, 'id' | 'created_at' | 'updated_at'>>): Promise<Episode> => {
    // Convert camelCase to snake_case for Supabase
    const dbUpdates: Record<string, any> = {}
    
    if (episode.title !== undefined) dbUpdates.title = episode.title
    if (episode.description !== undefined) dbUpdates.description = episode.description
    if (episode.audioUrl !== undefined) dbUpdates.audio_url = episode.audioUrl
    if (episode.videoUrl !== undefined) dbUpdates.video_url = episode.videoUrl
    if (episode.imageUrl !== undefined) dbUpdates.image_url = episode.imageUrl
    if (episode.publishedAt !== undefined) dbUpdates.published_at = episode.publishedAt
    if (episode.isPremium !== undefined) dbUpdates.is_premium = episode.isPremium
    if (episode.podcastId !== undefined) dbUpdates.podcast_id = episode.podcastId
    if (episode.status !== undefined) dbUpdates.status = episode.status
    if (episode.transcript !== undefined) dbUpdates.transcript = episode.transcript
    if (episode.slug !== undefined) dbUpdates.slug = episode.slug

    const { data, error } = await supabase
      .from('episodes')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Convert snake_case back to camelCase for frontend
    return {
      ...data,
      audioUrl: data.audio_url,
      videoUrl: data.video_url,
      imageUrl: data.image_url,
      publishedAt: data.published_at,
      podcastId: data.podcast_id,
      authorId: data.author_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isPremium: data.is_premium
    }
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
