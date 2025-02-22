import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  
  // First create a test podcast if needed
  const { data: podcast } = await client
    .from('podcasts')
    .select('id')
    .eq('slug', 'test-podcast')
    .single()

  let podcastId = podcast?.id

  if (!podcastId) {
    const { data: newPodcast } = await client
      .from('podcasts')
      .insert({
        title: 'Test Podcast',
        slug: 'test-podcast',
        description: 'A test podcast for Twitter Card development',
        status: 'published'
      })
      .select()
      .single()
    
    podcastId = newPodcast?.id
  }

  // Create a test episode
  const { data: episode, error } = await client
    .from('episodes')
    .insert({
      title: 'Test Episode for Twitter Card',
      slug: 'test-episode-twitter-card',
      description: 'This is a test episode to verify Twitter Card audio player functionality.',
      podcast_id: podcastId,
      status: 'published',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Test audio file
      duration: 372, // 6:12 in seconds
      published_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

  return episode
})
