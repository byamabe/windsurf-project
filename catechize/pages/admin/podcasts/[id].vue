<template>
  <div>
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Edit Podcast</h1>
        <p class="mt-2 text-sm text-gray-700">
          Update podcast details using the form below.
        </p>
      </div>
    </div>

    <div v-if="isLoading" class="mt-8 text-center">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
        <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
      </div>
    </div>

    <div v-else-if="podcast" class="mt-8">
      <PodcastForm
        :podcast="podcast"
        @submit="handleSubmit"
        @cancel="navigateBack"
      />
    </div>

    <div v-else class="mt-8">
      <p class="text-center text-gray-500">Podcast not found.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BasePodcast } from '~/composables/usePodcast'

const route = useRoute()
const router = useRouter()
const { fetchPodcast, updatePodcast } = usePodcast()
const toast = useToast()

const podcast = ref<BasePodcast>()
const isLoading = ref(true)

onMounted(async () => {
  try {
    podcast.value = await fetchPodcast(route.params.id as string)
  } catch (error) {
    console.error('Error loading podcast:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to load podcast',
      color: 'red'
    })
  } finally {
    isLoading.value = false
  }
})

const handleSubmit = async (updates: Omit<BasePodcast, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    await updatePodcast(route.params.id as string, updates)
    toast.add({
      title: 'Success',
      description: 'Podcast updated successfully',
      color: 'green'
    })
    router.push('/admin/podcasts')
  } catch (error) {
    console.error('Error updating podcast:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to update podcast',
      color: 'red'
    })
  }
}

const navigateBack = () => {
  router.push('/admin/podcasts')
}

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})
</script>
