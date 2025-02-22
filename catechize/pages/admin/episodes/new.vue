<template>
  <div>
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">New Episode for {{ podcast?.title }}</h1>
        <p class="mt-2 text-sm text-gray-700">
          Create a new episode for this podcast.
        </p>
      </div>
    </div>

    <div class="mt-8">
      <EpisodeForm
        :podcast-id="route.query.podcastId as string"
        :podcast-title="podcast?.title"
        @submit="handleSubmit"
        @cancel="navigateBack"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Episode } from '~/types/database'
import type { EpisodeFormData } from '~/components/EpisodeForm.vue'
import EpisodeForm from '~/components/EpisodeForm.vue'
import { usePodcast } from '~/composables/usePodcast'
import { useRoute, useRouter } from 'vue-router'
import { useEpisode } from '~/composables/useEpisode'
import { useToast } from '~/composables/useToast'
import { ref, onMounted } from 'vue'
import { useSupabaseUser } from '#imports'

const route = useRoute()
const router = useRouter()
const { createEpisode } = useEpisode()
const { fetchPodcast } = usePodcast()
const toast = useToast()
const user = useSupabaseUser()

const podcast = ref<BasePodcast>()
const isLoading = ref(true)

const navigateBack = () => {
  router.push(`/admin/episodes/podcast/${route.query.podcastId}`)
}

// Check if podcast exists and load its details
const loadPodcast = async () => {
  if (!route.query.podcastId) {
    toast.add({
      title: 'Error',
      description: 'No podcast ID provided',
      color: 'red'
    })
    navigateBack()
    return
  }

  try {
    podcast.value = await fetchPodcast(route.query.podcastId as string)
    if (!podcast.value) {
      toast.add({
        title: 'Error',
        description: 'Podcast not found',
        color: 'red'
      })
      router.push('/admin/podcasts')
    }
  } catch (error) {
    console.error('Error checking podcast:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to verify podcast existence',
      color: 'red'
    })
    router.push('/admin/podcasts')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadPodcast()
})

const handleSubmit = async (data: EpisodeFormData) => {
  const isPublished = data.status === 'published'
  const episode = {
    title: data.title,
    description: data.description,
    audioUrl: data.audioUrl,
    videoUrl: data.videoUrl,
    podcastId: route.params.podcastId as string,
    status: isPublished ? ('published' as const) : ('draft' as const),
    authorId: user.value?.id || '',
    isPremium: data.isPremium || false
  }
  
  await useEpisode().createEpisode(episode)
  navigateTo('/admin/episodes')
}

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})
</script>
