<template>
  <div 
    class="player-container"
    :style="{
      width: `${twitterConfig.player.width}px`,
      height: `${twitterConfig.player.height}px`,
    }"
  >
    <div v-if="episode?.audioUrl" class="relative h-full bg-gray-900">
      <!-- Background image with overlay -->
      <div 
        v-if="episode.imageUrl"
        class="absolute inset-0 bg-cover bg-center"
        :style="{ backgroundImage: `url(${episode.imageUrl})` }"
      >
        <div class="absolute inset-0 bg-black/50"></div>
      </div>

      <!-- Player content -->
      <div class="relative h-full flex flex-col justify-between p-4">
        <!-- Episode info -->
        <div class="text-white">
          <h1 class="text-lg font-bold truncate">{{ episode.title }}</h1>
          <p class="text-sm opacity-80 line-clamp-2">{{ episode.description }}</p>
        </div>

        <!-- Audio player -->
        <TwitterCardPlayer
          ref="player"
          :audio-url="episode.audioUrl"
          class="z-10"
        />
      </div>
    </div>

    <!-- Loading state -->
    <div v-else class="h-full flex items-center justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from '#imports'
import { useEpisode } from '~/composables/useEpisode'
import { twitterConfig } from '~/config/twitter'
import TwitterCardPlayer from '~/components/TwitterCardPlayer.vue'

interface PlayerEpisode {
  id: string
  title: string
  description: string
  audioUrl: string | null
  imageUrl?: string | null
}

const route = useRoute()
const { fetchEpisode } = useEpisode()
const episode = ref<PlayerEpisode | null>(null)
const player = ref()

// Fetch episode data
onMounted(async () => {
  try {
    const id = route.params.id as string
    const fetchedEpisode = await fetchEpisode(id)
    
    if (fetchedEpisode) {
      episode.value = {
        id: fetchedEpisode.id,
        title: fetchedEpisode.title || 'Untitled Episode',
        description: fetchedEpisode.description || 'Listen to this episode on Catechize',
        audioUrl: fetchedEpisode.audioUrl,
        imageUrl: fetchedEpisode.imageUrl
      }
    }
  } catch (error) {
    console.error('Error fetching episode:', error)
  }
})
</script>

<style scoped>
.player-container {
  overflow: hidden;
  border-radius: 8px;
  background: #1a1a1a;
}
</style>
