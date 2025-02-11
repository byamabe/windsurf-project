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
import type { BasePodcast } from '~/composables/usePodcast'

const router = useRouter()
const toast = useToast()
const { createPodcast } = usePodcast()

const handleSubmit = async (podcast: Omit<BasePodcast, 'id' | 'created_at' | 'updated_at'>) => {
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
  middleware: ['auth']
})
</script>
