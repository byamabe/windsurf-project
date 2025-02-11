<template>
  <div>
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Podcasts</h1>
        <p class="mt-2 text-sm text-gray-700">
          A list of all podcasts in your account including their title, description, and status.
        </p>
      </div>
      <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <NuxtLink
          to="/admin/podcasts/new"
          class="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Add podcast
        </NuxtLink>
      </div>
    </div>

    <!-- Podcast List -->
    <div class="mt-8 flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Title
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Description
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Episodes
                  </th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-if="podcasts.length === 0">
                  <td colspan="5" class="py-4 pl-4 pr-3 text-sm text-gray-500 text-center sm:pl-6">
                    No podcasts found. Click "Add podcast" to create one.
                  </td>
                </tr>
                <tr v-for="podcast in podcasts" :key="podcast.id">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    <NuxtLink
                      :to="`/admin/podcasts/${podcast.id}`"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      {{ podcast.title }}
                    </NuxtLink>
                  </td>
                  <td class="max-w-xs truncate px-3 py-4 text-sm text-gray-500">
                    {{ podcast.description }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span
                      :class="[
                        podcast.status === 'published'
                          ? 'text-green-700 bg-green-50 ring-green-600/20'
                          : 'text-gray-600 bg-gray-50 ring-gray-500/10',
                        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset'
                      ]"
                    >
                      {{ podcast.status }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ podcast.episode_count }}
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div class="flex justify-end gap-2">
                      <NuxtLink
                        :to="`/admin/episodes/podcast/${podcast.id}`"
                        class="text-blue-600 hover:text-blue-900"
                      >
                        Episodes
                      </NuxtLink>
                      <button
                        @click="handleDelete(podcast.id)"
                        class="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
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
import type { Podcast } from '~/composables/usePodcast'

const { fetchPodcasts, deletePodcast } = usePodcast()
const toast = useToast()
const podcasts = ref<Podcast[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    podcasts.value = await fetchPodcasts()
  } catch (error) {
    console.error('Error loading podcasts:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to load podcasts',
      color: 'red'
    })
  } finally {
    isLoading.value = false
  }
})

const handleDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this podcast?')) return

  try {
    await deletePodcast(id)
    podcasts.value = podcasts.value.filter(p => p.id !== id)
    toast.add({
      title: 'Success',
      description: 'Podcast deleted successfully',
      color: 'green'
    })
  } catch (error) {
    console.error('Error deleting podcast:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to delete podcast',
      color: 'red'
    })
  }
}

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

</script>
