<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div v-if="props.podcastTitle" class="mb-6">
      <h3 class="text-lg font-medium text-gray-900">Podcast: <span v-text="props.podcastTitle"></span></h3>
      <div class="mt-1 h-px bg-gray-200"></div>
    </div>

    <div>
      <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
      <input
        type="text"
        id="title"
        v-model="form.title"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
      <textarea
        id="description"
        v-model="form.description"
        rows="4"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="audio_url" class="block text-sm font-medium text-gray-700">Audio URL</label>
      <input
        type="url"
        id="audio_url"
        v-model="form.audio_url"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="video_url" class="block text-sm font-medium text-gray-700">Video URL</label>
      <input
        type="url"
        id="video_url"
        v-model="form.video_url"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="transcript" class="block text-sm font-medium text-gray-700">Transcript</label>
      <textarea
        id="transcript"
        v-model="form.transcript"
        rows="4"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="duration" class="block text-sm font-medium text-gray-700">Duration (seconds)</label>
      <input
        type="number"
        id="duration"
        v-model="form.duration"
        min="0"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="published_at" class="block text-sm font-medium text-gray-700">Publish Date</label>
      <input
        type="datetime-local"
        id="published_at"
        v-model="form.published_at"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
      <select
        id="status"
        v-model="form.status"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>
    </div>

    <div class="relative flex items-start">
      <div class="flex h-5 items-center">
        <input
          id="is_premium"
          type="checkbox"
          v-model="form.is_premium"
          class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
      <div class="ml-3 text-sm">
        <label for="is_premium" class="font-medium text-gray-700">Premium Episode</label>
        <p class="text-gray-500">Make this episode available only to premium subscribers</p>
      </div>
    </div>

    <div class="flex justify-end space-x-3">
      <button
        type="button"
        @click="$emit('cancel')"
        class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {{ props.episode ? 'Update' : 'Create' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { Episode } from '~/composables/useEpisode'
import { ref, watch } from 'vue'

const props = defineProps<{
  podcastId: string
  podcastTitle?: string
  episode?: Episode
}>()

const emit = defineEmits<{
  (e: 'submit', episode: Omit<Episode, 'id' | 'created_at' | 'updated_at'>): void
  (e: 'cancel'): void
}>()

const form = ref<Omit<Episode, 'id' | 'created_at' | 'updated_at'>>({
  podcast_id: props.podcastId,
  title: props.episode?.title ?? '',
  slug: props.episode?.slug ?? '',
  description: props.episode?.description ?? '',
  audio_url: props.episode?.audio_url ?? '',
  video_url: props.episode?.video_url ?? '',
  transcript: props.episode?.transcript ?? '',
  duration: props.episode?.duration ?? null,
  published_at: props.episode?.published_at 
    ? new Date(props.episode.published_at).toLocaleString('sv-SE', { timeZone: 'UTC' }).slice(0, 16) 
    : null,
  status: props.episode?.status ?? 'draft',
  is_premium: props.episode?.is_premium ?? false
})

// Watch for changes to podcastId and update form
watch(() => props.podcastId, (newId) => {
  form.value.podcast_id = newId
}, { immediate: true })

const handleSubmit = () => {
  // Make sure podcast_id is set
  form.value.podcast_id = props.podcastId

  // Generate slug from title if not provided
  if (!form.value.slug) {
    form.value.slug = form.value.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  // Convert the datetime-local value to UTC ISO string for the database
  const formData = { ...form.value }
  if (formData.published_at) {
    // Create a date object in local timezone
    const localDate = new Date(formData.published_at)
    // Convert to UTC ISO string while preserving the intended time
    formData.published_at = new Date(
      Date.UTC(
        localDate.getFullYear(),
        localDate.getMonth(),
        localDate.getDate(),
        localDate.getHours(),
        localDate.getMinutes()
      )
    ).toISOString()
  }

  console.log('Form submitting:', formData)
  emit('submit', formData)
}
</script>
