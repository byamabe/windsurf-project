import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Episode ID is required'
    })
  }

  const client = await serverSupabaseClient(event)
  const { data: episode, error } = await client
    .from('episodes')
    .select(`
      id,
      title,
      description,
      audio_url,
      podcasts (
        cover_image_url
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    throw createError({
      statusCode: error.code === 'PGRST116' ? 404 : 500,
      message: error.message
    })
  }

  // Transform the response to match our frontend interface
  return {
    id: episode.id,
    title: episode.title,
    description: episode.description,
    audioUrl: episode.audio_url,
    imageUrl: episode.podcasts?.cover_image_url || null
  }
})
