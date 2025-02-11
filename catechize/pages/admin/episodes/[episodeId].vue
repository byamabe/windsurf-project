<template>
  <div>
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Edit Episode</h1>
        <p class="mt-2 text-sm text-gray-700">
          Update the details of this episode.
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="mt-8 text-center">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
        <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
      </div>
    </div>

    <div v-else class="mt-8">
      <EpisodeForm
        :podcast-id="episode?.podcast_id ?? ''"
        :podcast-title="podcast?.title ?? ''"
        :episode="episode"
        @submit="handleSubmit"
        @cancel="navigateBack"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Episode } from '~/composables/useEpisode'
import type { BasePodcast } from '~/composables/usePodcast'

const route = useRoute()
const router = useRouter()
const { fetchEpisode, updateEpisode } = useEpisode()
const { fetchPodcast } = usePodcast()
const toast = useToast()

const episode = ref<Episode>()
const podcast = ref<BasePodcast>()
const isLoading = ref(true)

onMounted(async () => {
  try {
    episode.value = await fetchEpisode(route.params.episodeId as string)
    if (episode.value?.podcast_id) {
      podcast.value = await fetchPodcast(episode.value.podcast_id)
    }
  } catch (error) {
    console.error('Error loading episode:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to load episode',
      color: 'red'
    })
  } finally {
    isLoading.value = false
  }
})

const handleSubmit = async (updates: any) => {
  try {
    await updateEpisode(route.params.episodeId as string, updates)
    toast.add({
      title: 'Success',
      description: 'Episode updated successfully',
      color: 'green'
    })
    navigateBack()
  } catch (error) {
    console.error('Error updating episode:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to update episode',
      color: 'red'
    })
  }
}

const navigateBack = () => {
  router.push(`/admin/episodes/podcast/${episode.value?.podcast_id}`)
}

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})
</script>
