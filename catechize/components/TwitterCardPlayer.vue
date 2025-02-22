<template>
  <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-2 rounded-lg shadow-lg">
    <audio
      ref="audioElement"
      class="hidden"
      :src="audioUrl"
      preload="metadata"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
      @progress="handleProgress"
      @waiting="isLoading = true"
      @canplay="isLoading = false"
    >
      Your browser does not support the audio element.
    </audio>
    
    <!-- Progress bar -->
    <div class="relative mb-2">
      <!-- Loading indicator -->
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
        <div class="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></div>
      </div>

      <!-- Progress bar -->
      <div 
        ref="progressBar"
        class="w-full bg-gray-700/50 rounded-full h-1.5 cursor-pointer relative"
        @click="handleProgressClick"
        @mousedown="startDragging"
      >
        <div 
          class="bg-blue-500 h-full rounded-full transition-all duration-100"
          :style="{ width: `${(currentTime / duration) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-between">
      <!-- Time -->
      <div class="text-gray-400 text-xs w-14">
        {{ formatTime(currentTime) }}
      </div>

      <!-- Center controls -->
      <div class="flex items-center justify-center space-x-2">
        <button 
          @click="skipBackward"
          class="text-gray-400 hover:text-white focus:outline-none"
          title="Skip backward 15 seconds"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
          </svg>
        </button>

        <button 
          @click="togglePlay"
          class="text-white hover:text-blue-400 focus:outline-none"
          title="Play/Pause"
        >
          <svg v-if="!isPlaying" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <button 
          @click="skipForward"
          class="text-gray-400 hover:text-white focus:outline-none"
          title="Skip forward 15 seconds"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
          </svg>
        </button>
      </div>

      <!-- Speed control -->
      <div class="relative speed-control">
        <button 
          @click.stop="toggleSpeedPopup"
          class="text-xs text-gray-400 hover:text-white focus:outline-none w-14 text-right"
          title="Playback speed"
        >
          {{ playbackSpeed }}x
        </button>
        <div 
          v-if="showSpeedPopup"
          class="absolute bottom-full right-0 mb-1 bg-gray-800 rounded-lg shadow-lg p-2 z-50"
        >
          <div class="flex flex-col space-y-1">
            <button
              v-for="speed in [0.5, 1, 1.25, 1.5, 2]"
              :key="speed"
              @click.stop="setPlaybackSpeed(speed)"
              class="px-3 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              :class="{ 'text-blue-500': playbackSpeed === speed }"
            >
              {{ speed }}x
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  audioUrl: string
}>()

const audioElement = ref<HTMLAudioElement>()
const progressBar = ref<HTMLElement>()
const currentTime = ref(0)
const duration = ref(0)
const isPlaying = ref(false)
const isLoading = ref(false)
const playbackSpeed = ref(1)
const showSpeedPopup = ref(false)

// Time formatting
const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Playback controls
const togglePlay = () => {
  if (!audioElement.value) return
  if (isPlaying.value) {
    audioElement.value.pause()
  } else {
    audioElement.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const skipForward = () => {
  if (!audioElement.value) return
  audioElement.value.currentTime = Math.min(audioElement.value.currentTime + 15, duration.value)
}

const skipBackward = () => {
  if (!audioElement.value) return
  audioElement.value.currentTime = Math.max(audioElement.value.currentTime - 15, 0)
}

// Progress bar
const handleProgressClick = (event: MouseEvent) => {
  if (!progressBar.value || !audioElement.value) return
  const rect = progressBar.value.getBoundingClientRect()
  const pos = (event.clientX - rect.left) / rect.width
  audioElement.value.currentTime = pos * duration.value
}

const startDragging = (event: MouseEvent) => {
  if (!progressBar.value || !audioElement.value) return
  const handleDrag = (e: MouseEvent) => {
    const rect = progressBar.value!.getBoundingClientRect()
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audioElement.value!.currentTime = pos * duration.value
  }
  
  const stopDragging = () => {
    document.removeEventListener('mousemove', handleDrag)
    document.removeEventListener('mouseup', stopDragging)
  }
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDragging)
}

// Speed control
const toggleSpeedPopup = () => {
  showSpeedPopup.value = !showSpeedPopup.value
}

const setPlaybackSpeed = (speed: number) => {
  if (!audioElement.value) return
  playbackSpeed.value = speed
  audioElement.value.playbackRate = speed
  showSpeedPopup.value = false
}

// Event handlers
const handleTimeUpdate = () => {
  if (!audioElement.value) return
  currentTime.value = audioElement.value.currentTime
}

const handleLoadedMetadata = () => {
  if (!audioElement.value) return
  duration.value = audioElement.value.duration
}

const handleProgress = () => {
  isLoading.value = false
}

// Close speed popup when clicking outside
const closePopups = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.speed-control')) {
    showSpeedPopup.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', closePopups)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', closePopups)
})
</script>
