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
      <label for="audioUrl" class="block text-sm font-medium text-gray-700">Audio URL</label>
      <input
        type="url"
        id="audioUrl"
        v-model="formData.audioUrl"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="videoUrl" class="block text-sm font-medium text-gray-700 mt-4">Video URL</label>
      <input
        type="url"
        id="videoUrl"
        v-model="formData.videoUrl"
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
        v-model.number="formData.duration"
        min="0"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="publishedAt" class="block text-sm font-medium text-gray-700">Publish Date</label>
      <input
        type="datetime-local"
        id="publishedAt"
        v-model="formData.publishedAt"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div class="mt-4">
      <label class="block text-sm font-medium text-gray-700">Status</label>
      <select
        v-model="formData.status"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>
    </div>

    <div class="mt-4">
      <div class="flex items-center">
        <input
          id="isPremium"
          type="checkbox"
          v-model="formData.isPremium"
          class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label for="isPremium" class="ml-2 block text-sm text-gray-900">Premium Content</label>
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
import type { Episode } from '~/types'

// Form-specific version of Episode with nullable fields
export interface EpisodeFormData {
  // Required fields
  id?: string
  title: string
  podcastId: string
  authorId: string
  status: 'draft' | 'published' | 'archived'
  isPremium: boolean
  slug: string

  // Nullable fields
  description: string | null
  audioUrl: string | null
  videoUrl: string | null
  transcript: string | null
  publishedAt: string | null
  duration?: string
}

import { ref } from 'vue'
import { useSupabaseUser } from '#imports'

const props = defineProps<{
  initialData?: Partial<EpisodeFormData>
  podcastTitle?: string
  podcastId: string
}>()

const emit = defineEmits<{
  (e: 'submit', data: EpisodeFormData): void
  (e: 'cancel'): void
  (e: 'error', error: Error): void
}>()

const user = useSupabaseUser()
const generateSlug = (title: string) => {
  return title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const formData = ref<EpisodeFormData>({
  id: props.initialData?.id,
  title: props.initialData?.title ?? '',
  description: props.initialData?.description ?? null,
  audioUrl: props.initialData?.audioUrl ?? null,
  videoUrl: props.initialData?.videoUrl ?? null,
  publishedAt: props.initialData?.publishedAt ?? null,
  transcript: props.initialData?.transcript ?? null,
  duration: props.initialData?.duration,
  podcastId: props.podcastId,
  authorId: user.value?.id ?? '',
  status: props.initialData?.status ?? 'draft',
  isPremium: props.initialData?.isPremium ?? false,
  slug: props.initialData?.slug ?? generateSlug(props.initialData?.title ?? '')
})

const handleSubmit = async () => {
  try {
    // Generate slug from title if not provided
    if (!formData.value.slug && formData.value.title) {
      formData.value.slug = generateSlug(formData.value.title)
    }

    // Ensure required fields are set
    if (!formData.value.podcastId) {
      throw new Error('Podcast ID is required')
    }

    if (!formData.value.authorId) {
      throw new Error('Author ID is required')
    }

    console.log('Submitting form data:', formData.value)
    emit('submit', formData.value)
  } catch (error) {
    console.error('Error in form submission:', error)
    emit('error', error instanceof Error ? error : new Error(String(error)))
  }
}
</script>
