<template>
  <div>
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">New Podcast</h1>
        <p class="mt-2 text-sm text-gray-700">
          Create a new podcast by filling out the form below.
        </p>
      </div>
    </div>

    <div class="mt-8">
      <PodcastForm @submit="handleSubmit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Podcast } from '~/composables/usePodcast'
import { useRouter } from '#imports'
import { useSupabaseUser } from '#imports'

const router = useRouter()
const user = useSupabaseUser()
const toast = useToast()
const { createPodcast } = usePodcast()

interface PodcastFormData {
  title: string
  description: string | null
  cover_image_url: string | null
  rss_feed_url: string | null
  website_url: string | null
  slug: string
  status: 'draft' | 'published' | 'archived'
}

const handleSubmit = async (data: PodcastFormData) => {
  const podcast: Omit<Podcast, 'id' | 'created_at' | 'updated_at' | 'episode_count'> = {
    title: data.title,
    description: data.description,
    cover_image_url: data.cover_image_url,
    rss_feed_url: data.rss_feed_url,
    website_url: data.website_url,
    slug: data.slug,
    status: data.status,
    published: data.status === 'published',
    author_id: user.value?.id || ''
  }
  
  try {
    await createPodcast(podcast)
    toast.add({
      title: 'Success',
      description: 'Podcast created successfully',
      color: 'green'
    })
    router.push('/admin/podcasts')
  } catch (error) {
    console.error('Error creating podcast:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to create podcast',
      color: 'red'
    })
  }
}

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})
</script>
