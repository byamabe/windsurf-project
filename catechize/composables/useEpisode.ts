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
  duration?: string
  createdAt?: string
  updatedAt?: string
}

export const useEpisode = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const fetchEpisodes = async (podcastId: string): Promise<Episode[]> => {
    try {
      const { data: episodes, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('podcast_id', podcastId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching episodes:', error)
        throw error
      }

      // Convert snake_case to camelCase for frontend
      return episodes.map(episode => ({
        id: episode.id,
        title: episode.title,
        description: episode.description,
        audioUrl: episode.audio_url,
        videoUrl: episode.video_url,
        publishedAt: episode.published_at,
        isPremium: episode.is_premium,
        podcastId: episode.podcast_id,
        status: episode.status,
        authorId: episode.author_id,
        transcript: episode.transcript,
        slug: episode.slug,
        duration: episode.duration,
        createdAt: episode.created_at,
        updatedAt: episode.updated_at
      }))
    } catch (error) {
      console.error('Error fetching episodes:', error)
      throw error
    }
  }

  const fetchEpisode = async (id: string): Promise<Episode> => {
    try {
      console.log('Fetching episode:', id)
      const { data: episode, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching episode:', error)
        throw error
      }

      console.log('Supabase response:', { episode })
      
      // Convert snake_case to camelCase
      return {
        id: episode.id,
        title: episode.title,
        description: episode.description,
        audioUrl: episode.audio_url,
        videoUrl: episode.video_url,
        publishedAt: episode.published_at,
        isPremium: episode.is_premium,
        podcastId: episode.podcast_id,
        status: episode.status,
        authorId: episode.author_id,
        transcript: episode.transcript,
        slug: episode.slug,
        duration: episode.duration,
        createdAt: episode.created_at,
        updatedAt: episode.updated_at
      }
    } catch (error) {
      console.error('Error fetching episode:', error)
      throw error
    }
  }

  const createEpisode = async (episode: Omit<Episode, 'id' | 'created_at' | 'updated_at'>): Promise<Episode> => {
    if (!user.value) throw new Error('User must be logged in to create an episode')

    // Convert camelCase to snake_case for Supabase and map status to published
    const dbEpisode = {
      title: episode.title,
      description: episode.description,
      audio_url: episode.audioUrl,
      video_url: episode.videoUrl,
      published_at: episode.publishedAt,
      is_premium: episode.isPremium ?? false,
      podcast_id: episode.podcastId,
      status: episode.status,
      author_id: user.value.id,
      transcript: episode.transcript,
      slug: episode.slug,
      duration: episode.duration || undefined
    }

    console.log('Creating episode with data:', dbEpisode)

    try {
      const { data, error } = await supabase
        .from('episodes')
        .insert(dbEpisode)
        .select()
        .single()

      if (error) {
        console.error('Error creating episode:', error)
        throw error
      }

      console.log('Episode created successfully:', data)

      // Convert snake_case back to camelCase for frontend
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        audioUrl: data.audio_url,
        videoUrl: data.video_url,
        publishedAt: data.published_at,
        isPremium: data.is_premium,
        podcastId: data.podcast_id,
        status: data.status,
        authorId: data.author_id,
        transcript: data.transcript,
        slug: data.slug,
        duration: data.duration,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('Error creating episode:', error)
      throw error
    }
  }

  const updateEpisode = async (id: string, episode: Partial<Omit<Episode, 'id' | 'created_at' | 'updated_at'>>): Promise<Episode> => {
    // Convert camelCase to snake_case for Supabase
    const dbUpdates: Record<string, any> = {}
    
    if (episode.title !== undefined) dbUpdates.title = episode.title
    if (episode.description !== undefined) dbUpdates.description = episode.description
    if (episode.audioUrl !== undefined) dbUpdates.audio_url = episode.audioUrl
    if (episode.videoUrl !== undefined) dbUpdates.video_url = episode.videoUrl
    if (episode.publishedAt !== undefined) dbUpdates.published_at = episode.publishedAt
    if (episode.isPremium !== undefined) dbUpdates.is_premium = episode.isPremium
    if (episode.podcastId !== undefined) dbUpdates.podcast_id = episode.podcastId
    if (episode.status !== undefined) dbUpdates.status = episode.status
    if (episode.transcript !== undefined) dbUpdates.transcript = episode.transcript
    if (episode.slug !== undefined) dbUpdates.slug = episode.slug
    if (episode.duration !== undefined) dbUpdates.duration = episode.duration || undefined

    try {
      const { data, error } = await supabase
        .from('episodes')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating episode:', error)
        throw error
      }

      // Convert snake_case back to camelCase for frontend
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        audioUrl: data.audio_url,
        videoUrl: data.video_url,
        publishedAt: data.published_at,
        isPremium: data.is_premium,
        podcastId: data.podcast_id,
        status: data.status,
        authorId: data.author_id,
        transcript: data.transcript,
        slug: data.slug,
        duration: data.duration,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('Error updating episode:', error)
      throw error
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
