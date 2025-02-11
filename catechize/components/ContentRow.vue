<template>
  <div class="py-8">
    <div class="flex justify-between items-center mb-4 px-4">
      <h2 class="text-5xl font-bold text-white">{{ title }}</h2>
      <NuxtLink
        :to="viewAllLink"
        class="text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm font-medium"
      >
        View All
      </NuxtLink>
    </div>
    <div class="relative group">
      <!-- Previous Button -->
      <button
        class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
        :disabled="scrollPosition <= 0"
        @click="scroll(-1)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Content Scroll -->
      <div
        ref="scrollContainer"
        class="flex overflow-x-auto scrollbar-hide scroll-smooth gap-4 px-4"
        @scroll="updateScrollPosition"
      >
        <div
          v-for="item in items"
          :key="item.id"
          class="flex-none w-64 relative group/item"
        >
          <NuxtLink :to="item.link || '#'" class="block">
            <div 
              class="aspect-video rounded-md relative transition-colors duration-300 group/card overflow-hidden"
              :class="getColorClass(title)"
            >
              <!-- Title -->
              <div class="absolute inset-0 flex items-center justify-center p-6 transition-opacity duration-300 group-hover/card:opacity-0">
                <h3 class="text-white font-bold text-2xl line-clamp-3 text-center leading-tight">{{ item.title }}</h3>
              </div>
              
              <!-- Description Overlay -->
              <div class="absolute inset-0 flex items-center justify-center p-6 bg-black/80 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
                <div class="text-white">
                  <h3 class="font-bold text-xl mb-2 line-clamp-1">{{ item.title }}</h3>
                  <p v-if="item.description" class="text-sm line-clamp-4">{{ item.description }}</p>
                  <p v-else class="text-sm italic">No description available</p>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Next Button -->
      <button
        class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
        :disabled="scrollPosition >= maxScroll"
        @click="scroll(1)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  title: string
  items: Array<{
    id: string | number
    title: string
    description: string | null
    thumbnail?: string
    cover_image_url?: string | null
    link?: string
  }>
  viewAllLink: string
}>()

const scrollContainer = ref<HTMLElement | null>(null)
const scrollPosition = ref(0)
const maxScroll = ref(0)

// Color classes for different card types
const cardColors = {
  'Featured Podcasts': 'bg-blue-900 hover:bg-blue-800',
  'Latest Episodes': 'bg-purple-900 hover:bg-purple-800',
  'Popular in Loci': 'bg-pink-900 hover:bg-pink-800',
  'Top Authors': 'bg-violet-900 hover:bg-violet-800',
  'Trending Questions': 'bg-emerald-900 hover:bg-emerald-800',
  default: 'bg-gray-800 hover:bg-gray-700'
}

// Get color class based on section title
const getColorClass = (sectionTitle?: string) => {
  return cardColors[sectionTitle as keyof typeof cardColors] || cardColors.default
}

const updateScrollPosition = () => {
  if (!scrollContainer.value) return
  scrollPosition.value = scrollContainer.value.scrollLeft
  maxScroll.value = scrollContainer.value.scrollWidth - scrollContainer.value.clientWidth
}

const scroll = (direction: number) => {
  if (!scrollContainer.value) return
  const scrollAmount = scrollContainer.value.clientWidth * 0.8
  scrollContainer.value.scrollBy({
    left: direction * scrollAmount,
    behavior: 'smooth'
  })
}

onMounted(() => {
  updateScrollPosition()
  window.addEventListener('resize', updateScrollPosition)
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
