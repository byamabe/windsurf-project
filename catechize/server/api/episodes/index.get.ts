import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  
  const { data: episodes, error } = await client
    .from('episodes')
    .select('id, title, description, audio_url')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(10)

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

  return episodes
})
