<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
      <input
        id="title"
        v-model="formData.title"
        type="text"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="slug" class="block text-sm font-medium text-gray-700">Slug</label>
      <input
        id="slug"
        v-model="formData.slug"
        type="text"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
      <textarea
        id="description"
        v-model="formData.description"
        rows="3"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="cover_image_url" class="block text-sm font-medium text-gray-700">Cover Image URL</label>
      <input
        id="cover_image_url"
        v-model="formData.cover_image_url"
        type="url"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="rss_feed_url" class="block text-sm font-medium text-gray-700">RSS Feed URL</label>
      <input
        id="rss_feed_url"
        v-model="formData.rss_feed_url"
        type="url"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="website_url" class="block text-sm font-medium text-gray-700">Website URL</label>
      <input
        id="website_url"
        v-model="formData.website_url"
        type="url"
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

    <div class="flex justify-end gap-3">
      <NuxtLink
        to="/admin/podcasts"
        class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        @click="emit('cancel')"
      >
        Cancel
      </NuxtLink>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
      >
        {{ isSubmitting ? 'Saving...' : 'Save' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
export interface PodcastFormData {
  title: string
  description: string | null
  cover_image_url: string | null
  slug: string
  rss_feed_url: string | null
  website_url: string | null
  status: 'draft' | 'published' | 'archived'
  author_id: string
}

import type { BasePodcast } from '~/composables/usePodcast'

const props = defineProps<{
  initialData?: Partial<PodcastFormData>
}>()

const emit = defineEmits<{
  (e: 'submit', data: PodcastFormData): void
  (e: 'cancel'): void
}>()

const formData = ref<PodcastFormData>({
  title: '',
  description: null,
  cover_image_url: null,
  slug: '',
  rss_feed_url: null,
  website_url: null,
  status: 'draft',
  author_id: '',
  ...props.initialData
})

const isSubmitting = ref(false)

// Initialize form with initial data if provided
onMounted(() => {
  if (props.initialData) {
    formData.value = {
      title: props.initialData.title ?? '',
      slug: props.initialData.slug ?? '',
      description: props.initialData.description ?? null,
      cover_image_url: props.initialData.cover_image_url ?? null,
      rss_feed_url: props.initialData.rss_feed_url ?? null,
      website_url: props.initialData.website_url ?? null,
      status: props.initialData.status ?? 'draft',
      author_id: props.initialData.author_id ?? ''
    }
  }
})

const handleSubmit = async () => {
  emit('submit', formData.value)
}
</script>
