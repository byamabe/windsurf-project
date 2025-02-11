<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
      <input
        id="title"
        v-model="form.title"
        type="text"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="slug" class="block text-sm font-medium text-gray-700">Slug</label>
      <input
        id="slug"
        v-model="form.slug"
        type="text"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
      <textarea
        id="description"
        v-model="form.description"
        rows="3"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="cover_image_url" class="block text-sm font-medium text-gray-700">Cover Image URL</label>
      <input
        id="cover_image_url"
        v-model="form.cover_image_url"
        type="url"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="rss_feed_url" class="block text-sm font-medium text-gray-700">RSS Feed URL</label>
      <input
        id="rss_feed_url"
        v-model="form.rss_feed_url"
        type="url"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="website_url" class="block text-sm font-medium text-gray-700">Website URL</label>
      <input
        id="website_url"
        v-model="form.website_url"
        type="url"
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
import type { BasePodcast } from '~/composables/usePodcast'

const props = defineProps<{
  podcast?: BasePodcast
}>()

const emit = defineEmits<{
  (e: 'submit', podcast: Omit<BasePodcast, 'id' | 'created_at' | 'updated_at'>): void
  (e: 'cancel'): void
}>()

type PodcastFormData = {
  title: string
  slug: string
  description: string
  cover_image_url: string
  rss_feed_url: string
  website_url: string
  status: 'draft' | 'published' | 'archived'
}

const form = ref<PodcastFormData>({
  title: '',
  slug: '',
  description: '',
  cover_image_url: '',
  rss_feed_url: '',
  website_url: '',
  status: 'draft'
})

const isSubmitting = ref(false)

// Initialize form with initial data if provided
onMounted(() => {
  if (props.podcast) {
    form.value = {
      title: props.podcast.title ?? '',
      slug: props.podcast.slug ?? '',
      description: props.podcast.description ?? '',
      cover_image_url: props.podcast.cover_image_url ?? '',
      rss_feed_url: props.podcast.rss_feed_url ?? '',
      website_url: props.podcast.website_url ?? '',
      status: props.podcast.status ?? 'draft'
    }
  }
})

// Auto-generate slug from title
watch(() => form.value.title, (newTitle) => {
  if (!props.podcast?.slug) {
    form.value.slug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
})

const handleSubmit = async () => {
  console.log('Form submitted:', form.value)
  isSubmitting.value = true
  try {
    emit('submit', {
      title: form.value.title,
      slug: form.value.slug,
      description: form.value.description || null,
      cover_image_url: form.value.cover_image_url || null,
      rss_feed_url: form.value.rss_feed_url || null,
      website_url: form.value.website_url || null,
      status: form.value.status
    })
  } catch (error) {
    console.error('Error in form submission:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
