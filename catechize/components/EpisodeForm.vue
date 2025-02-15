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
        v-model="formData.title"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
      <textarea
        id="description"
        v-model="formData.description"
        rows="4"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="audio_url" class="block text-sm font-medium text-gray-700">Audio URL</label>
      <input
        type="url"
        id="audio_url"
        v-model="formData.audio_url"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="video_url" class="block text-sm font-medium text-gray-700">Video URL</label>
      <input
        type="url"
        id="video_url"
        v-model="formData.video_url"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="transcript" class="block text-sm font-medium text-gray-700">Transcript</label>
      <textarea
        id="transcript"
        v-model="formData.transcript"
        rows="4"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="duration" class="block text-sm font-medium text-gray-700">Duration (seconds)</label>
      <input
        type="number"
        id="duration"
        v-model="formData.duration"
        min="0"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="published_at" class="block text-sm font-medium text-gray-700">Publish Date</label>
      <input
        type="datetime-local"
        id="published_at"
        v-model="formData.published_at"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
      <select
        id="status"
        v-model="formData.status"
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
          v-model="formData.is_premium"
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
        {{ props.initialData ? 'Update' : 'Create' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
export interface EpisodeFormData {
  title: string
  description: string | null
  audio_url: string | null
  video_url: string | null
  transcript: string | null
  published_at: string | null
  slug: string
  duration: number | null
  podcast_id: string
  status: 'draft' | 'published' | 'archived'
  author_id: string
  is_premium: boolean
}

import { ref } from 'vue'

const props = defineProps<{
  initialData?: Partial<EpisodeFormData>
  podcastTitle?: string
}>()

const emit = defineEmits<{
  (e: 'submit', data: EpisodeFormData): void
  (e: 'cancel'): void
}>()

const formData = ref<EpisodeFormData>({
  title: '',
  description: null,
  audio_url: null,
  video_url: null,
  transcript: null,
  published_at: null,
  slug: '',
  duration: null,
  podcast_id: '',
  status: 'draft',
  author_id: '',
  is_premium: false,
  ...props.initialData
})

const handleSubmit = async () => {
  emit('submit', formData.value)
}
</script>
