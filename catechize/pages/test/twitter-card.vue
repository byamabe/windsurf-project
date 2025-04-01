<template>
  <div class="min-h-screen bg-gray-900 py-12">
    <div class="container mx-auto px-4">
      <h1 class="text-2xl font-bold text-white mb-8">Twitter Card Test</h1>
      
      <!-- Input Form -->
      <div class="mb-8">
        <input 
          v-model="episodeId"
          type="text"
          placeholder="Enter episode ID"
          class="w-full max-w-md px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
          @keyup.enter="loadEpisode"
        />
        <button 
          @click="loadEpisode"
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Load Episode
        </button>
      </div>

      <!-- Player Preview -->
      <div v-if="episode" class="space-y-8">
        <div>
          <h2 class="text-xl font-semibold text-white mb-4">Episode Details</h2>
          <div class="bg-gray-800 rounded p-4 text-gray-300">
            <p><span class="font-medium">Title:</span> {{ episode.title }}</p>
            <p><span class="font-medium">Description:</span> {{ episode.description }}</p>
            <p><span class="font-medium">Audio URL:</span> {{ episode.audioUrl }}</p>
          </div>
        </div>

        <div>
          <h2 class="text-xl font-semibold text-white mb-4">Player Preview</h2>
          <div 
            class="bg-gray-800 rounded p-4"
            :style="{
              width: `${twitterConfig.player.width + 32}px`,
            }"
          >
            <iframe
              v-if="episode"
              :src="`/episodes/${episode.id}-player`"
              :width="twitterConfig.player.width"
              :height="twitterConfig.player.height"
              frameborder="0"
              class="rounded"
            ></iframe>
          </div>
        </div>

        <div>
          <h2 class="text-xl font-semibold text-white mb-4">Test Links</h2>
          <div class="space-y-4">
            <div>
              <p class="text-gray-400 mb-2">Episode Page URL:</p>
              <a 
                :href="`/episodes/${episode.id}`"
                target="_blank"
                class="text-blue-400 hover:text-blue-300 break-all"
              >
                {{ `${baseUrl}/episodes/${episode.id}` }}
              </a>
            </div>
            <div>
              <p class="text-gray-400 mb-2">Player Page URL:</p>
              <a 
                :href="`/episodes/${episode.id}-player`"
                target="_blank"
                class="text-blue-400 hover:text-blue-300 break-all"
              >
                {{ `${baseUrl}/episodes/${episode.id}-player` }}
              </a>
            </div>
            <div>
              <p class="text-gray-400 mb-2">Twitter Card Validator:</p>
              <a 
                :href="`https://cards-dev.twitter.com/validator?url=${encodeURIComponent(
                  `${baseUrl}/episodes/${episode.id}`
                )}`"
                target="_blank"
                class="text-blue-400 hover:text-blue-300"
              >
                Test in Twitter Card Validator
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-red-500">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useEpisode } from '~/composables/useEpisode'
import { twitterConfig } from '~/config/twitter'

const episodeId = ref('')
const episode = ref<any>(null)
const error = ref<string | null>(null)
const { fetchEpisode } = useEpisode()

const config = useRuntimeConfig()
const baseUrl = config.public.siteUrl || 'https://catechize.org'

async function loadEpisode() {
  if (!episodeId.value) {
    error.value = 'Please enter an episode ID'
    return
  }

  try {
    error.value = null
    episode.value = await fetchEpisode(episodeId.value)
    
    if (!episode.value) {
      error.value = 'Episode not found'
    }
  } catch (e) {
    error.value = 'Error loading episode'
    console.error('Error:', e)
  }
}
</script>
