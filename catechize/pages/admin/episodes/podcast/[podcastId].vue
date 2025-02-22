<template>
  <div>
    <div class="mb-8">
      <NuxtLink
        to="/admin/podcasts"
        class="text-sm text-blue-600 hover:text-blue-900 flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Back to Podcasts
      </NuxtLink>
    </div>

    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <div v-if="podcast" class="mb-4">
          <h1 class="text-2xl font-semibold text-gray-900">{{ podcast.title }}</h1>
          <p class="mt-1 text-sm text-gray-500">{{ podcast.description }}</p>
        </div>
        <h1 class="text-2xl font-semibold text-gray-900">Episodes</h1>
        <p class="mt-2 text-sm text-gray-700">
          A list of all episodes for this podcast including their title, description, and status.
        </p>
      </div>
      <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <NuxtLink
          :to="`/admin/episodes/new?podcastId=${route.params.podcastId}`"
          class="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Add episode
        </NuxtLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="mt-8 text-center">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
        <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
      </div>
    </div>

    <!-- Episode List -->
    <div v-else class="mt-8 flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Title
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Description
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Premium
                  </th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-if="episodes.length === 0">
                  <td colspan="5" class="py-4 pl-4 pr-3 text-sm text-gray-500 text-center sm:pl-6">
                    No episodes found. Click "Add episode" to create one.
                  </td>
                </tr>
                <tr v-for="episode in episodes" :key="episode.id">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6">
                    <NuxtLink
                      :to="`/admin/episodes/${episode.id}`"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      {{ episode.title }}
                    </NuxtLink>
                  </td>
                  <td class="max-w-xs truncate px-3 py-4 text-sm text-gray-500">
                    {{ episode.description }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span
                      :class="[
                        episode.status === 'published'
                          ? 'text-green-700 bg-green-50'
                          : episode.status === 'draft'
                          ? 'text-yellow-700 bg-yellow-50'
                          : 'text-red-700 bg-red-50',
                        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
                        episode.status === 'published'
                          ? 'ring-green-600/20'
                          : episode.status === 'draft'
                          ? 'ring-yellow-600/20'
                          : 'ring-red-600/20',
                      ]"
                    >
                      {{ episode.status }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span
                      :class="[
                        episode.isPremium
                          ? 'text-blue-700 bg-blue-50 ring-blue-600/20'
                          : 'text-gray-700 bg-gray-50 ring-gray-600/20',
                        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ml-2',
                      ]"
                    >
                      {{ episode.isPremium ? 'Premium' : 'Free' }}
                    </span>
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      @click="handleDelete(episode.id)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Episode } from '~/composables/useEpisode'
import type { BasePodcast } from '~/composables/usePodcast'
import { useRoute } from 'vue-router'
import { useNotification } from '~/composables/useNotification'

const route = useRoute()
const { fetchEpisodes, deleteEpisode } = useEpisode()
const { fetchPodcast } = usePodcast()
const { add: notify } = useNotification()

const episodes = ref<Episode[]>([])
const podcast = ref<BasePodcast | null>(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    const podcastId = route.params.podcastId as string
    const [podcastData, episodesData] = await Promise.all([
      fetchPodcast(podcastId),
      fetchEpisodes(podcastId)
    ])
    
    podcast.value = podcastData
    episodes.value = episodesData
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    isLoading.value = false
  }
})

async function handleDelete(id: string) {
  if (!confirm('Are you sure you want to delete this episode?')) return

  try {
    await deleteEpisode(id)
    episodes.value = episodes.value.filter(e => e.id !== id)
    notify({
      title: 'Success',
      description: 'Episode deleted successfully',
      type: 'success'
    })
  } catch (error) {
    console.error('Error deleting episode:', error)
    notify({
      title: 'Error',
      description: 'Failed to delete episode',
      type: 'error'
    })
  }
}

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})
</script>
