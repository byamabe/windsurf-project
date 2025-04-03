<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-8">Media Player Test Page</h1>

    <div class="space-y-12">
      <!-- Audio Player Test -->
      <div class="bg-gray-900 p-6 rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Audio Player</h2>
        <MediaPlayer
          type="audio"
          url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
          @timeupdate="handleTimeUpdate"
          @seeked="handleSeeked"
          @error="handleError"
        />
      </div>

      <!-- Video Player Test -->
      <div class="bg-gray-900 p-6 rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Video Player</h2>
        <MediaPlayer
          type="video"
          url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          @timeupdate="handleTimeUpdate"
          @seeked="handleSeeked"
          @error="handleError"
        />
      </div>

      <!-- YouTube Player Test -->
      <div class="bg-gray-900 p-6 rounded-lg">
        <h2 class="text-xl font-semibold mb-4">YouTube Player</h2>
        <MediaPlayer
          type="youtube"
          url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          @timeupdate="handleTimeUpdate"
          @seeked="handleSeeked"
          @error="handleError"
        />
      </div>

      <!-- Event Log -->
      <div class="bg-gray-900 p-6 rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Event Log</h2>
        <div class="space-y-2 text-sm font-mono">
          <div v-for="(log, index) in eventLogs" :key="index" class="text-gray-400">
            {{ log }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MediaPlayer from '~/components/MediaPlayer.vue'

// Event logging
const eventLogs = ref<string[]>([])

const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  eventLogs.value.unshift(`[${timestamp}] ${message}`)
  if (eventLogs.value.length > 50) {
    eventLogs.value.pop()
  }
}

// Event handlers
const handleTimeUpdate = (time: number) => {
  addLog(`Time update: ${time.toFixed(2)}s`)
}

const handleSeeked = (seekInfo: { start: number; end: number }) => {
  addLog(`Seeked from ${seekInfo.start.toFixed(2)}s to ${seekInfo.end.toFixed(2)}s`)
}

const handleError = (error: Error) => {
  addLog(`Error: ${error.message}`)
}

// Page metadata
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})
</script>
