<template>
  <div class="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-lg">
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
    <div class="relative mb-4">
      <!-- Loading indicator -->
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
        <div class="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
      </div>

      <!-- Buffer bar -->
      <div class="absolute inset-0">
        <div 
          v-for="(buffer, index) in buffered" 
          :key="index"
          class="absolute h-full bg-gray-600 rounded-full"
          :style="{ 
            left: `${(buffer.start / duration) * 100}%`,
            width: `${((buffer.end - buffer.start) / duration) * 100}%`
          }"
        ></div>
      </div>

      <!-- Progress bar -->
      <div 
        ref="progressBar"
        class="w-full bg-gray-700 rounded-full h-2 cursor-pointer relative"
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
    <div class="flex items-center">
      <!-- Left time -->
      <div class="text-gray-400 w-20 text-right shrink-0">
        {{ formatTime(currentTime) }}
      </div>

      <!-- Center controls -->
      <div class="flex-1 flex items-center justify-center mx-4">
        <div class="flex items-center justify-center space-x-4">
          <button 
            @click="skipBackward"
            class="text-gray-400 hover:text-white focus:outline-none"
            title="Skip backward 15 seconds"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>

          <button 
            @click="togglePlay"
            class="text-white hover:text-blue-400 focus:outline-none"
            title="Play/Pause"
          >
            <svg v-if="!isPlaying" class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <button 
            @click="skipForward"
            class="text-gray-400 hover:text-white focus:outline-none"
            title="Skip forward 15 seconds"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Right side -->
      <div class="flex items-center space-x-4 shrink-0">
        <!-- Volume control -->
        <div class="flex items-center space-x-2 relative volume-control">
          <button 
            @click="toggleVolumePopup"
            class="text-gray-400 hover:text-white focus:outline-none"
            :title="isMuted ? 'Unmute' : 'Mute'"
          >
            <svg v-if="isMuted || volume === 0" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
            <svg v-else-if="volume < 0.5" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M17.536 6.464a9 9 0 010 11.072" />
            </svg>
          </button>
          
          <!-- Volume slider -->
          <div 
            v-if="isVolumeOpen"
            class="absolute top-full -left-24 mt-1 bg-gray-700 p-2 rounded-lg shadow-lg"
          >
            <div class="flex items-center space-x-2">
              <button @click="toggleMute" class="text-gray-400 hover:text-white">
                <svg v-if="isMuted" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18 9.75l-6 6m0 0l-6-6m6 6V9" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model="volume"
                class="w-24 accent-blue-500"
                @input="handleVolumeChange"
              >
            </div>
          </div>
        </div>

        <!-- Playback speed -->
        <div class="relative speed-control">
          <button 
            @click="toggleSpeedPopup"
            class="text-gray-400 hover:text-white focus:outline-none px-2 py-1 rounded"
            title="Playback Speed"
          >
            {{ playbackSpeed }}x
          </button>
          
          <!-- Speed options -->
          <div 
            v-if="isSpeedOpen"
            class="absolute top-full -right-12 mt-1 bg-gray-700 rounded-lg shadow-lg"
          >
            <div class="py-1">
              <button 
                v-for="speed in [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]"
                :key="speed"
                @click="setPlaybackSpeed(speed)"
                class="block w-full px-4 py-1 text-sm text-left text-gray-300 hover:bg-gray-600 hover:text-white whitespace-nowrap"
                :class="{ 'text-blue-400': playbackSpeed === speed }"
              >
                {{ speed }}x
              </button>
            </div>
          </div>
        </div>

        <!-- Duration -->
        <span class="text-gray-400 w-20">
          {{ formatTime(duration) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TimeRange {
  start: number
  end: number
}

import { ref, onMounted, onUnmounted, defineExpose, defineEmits } from 'vue'
import AudioWaveform from './AudioWaveform.vue'

const props = defineProps<{
  audioUrl: string
  timeRanges?: Array<{
    start: number
    end: number
    label: string
  }>
}>()

const emit = defineEmits<{
  (e: 'timeupdate', time: number): void
  (e: 'durationchange', duration: number): void
  (e: 'seeked', time: TimeRange): void
}>()

const audioElement = ref<HTMLAudioElement | null>(null)
const progressBar = ref<HTMLElement | null>(null)
const currentTime = ref(0)
const duration = ref(0)
const isPlaying = ref(false)
const isLoading = ref(false)
const volume = ref(1)
const isMuted = ref(false)
const playbackSpeed = ref(1)
const buffered = ref<TimeRange[]>([])
const isVolumeOpen = ref(false)
const isSpeedOpen = ref(false)
const isDragging = ref(false)

// Close popups when clicking outside
const closePopups = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.volume-control')) {
    isVolumeOpen.value = false
  }
  if (!target.closest('.speed-control')) {
    isSpeedOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closePopups)
  document.addEventListener('keydown', handleKeydown)
  if (audioElement.value) {
    audioElement.value.volume = volume.value
  }
})

onUnmounted(() => {
  if (audioElement.value) {
    audioElement.value.pause()
  }
  document.removeEventListener('click', closePopups)
  document.removeEventListener('keydown', handleKeydown)
})

const handleTimeUpdate = () => {
  if (audioElement.value && !isDragging.value) {
    currentTime.value = audioElement.value.currentTime
    emit('timeupdate', currentTime.value)
  }
}

const handleLoadedMetadata = () => {
  if (audioElement.value) {
    duration.value = audioElement.value.duration
  }
}

const handleProgress = () => {
  if (audioElement.value) {
    const timeRanges = audioElement.value.buffered
    const newBuffered: TimeRange[] = []
    for (let i = 0; i < timeRanges.length; i++) {
      newBuffered.push({
        start: timeRanges.start(i),
        end: timeRanges.end(i)
      })
    }
    buffered.value = newBuffered
  }
}

const seek = (time: TimeRange) => {
  if (!audioElement.value) return
  audioElement.value.currentTime = time.start
  emit('seeked', time)
}

const timeRanges = ref(props.timeRanges || [])

const formatTime = (time: number): string => {
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = Math.floor(time % 60)
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const togglePlay = () => {
  if (audioElement.value) {
    if (isPlaying.value) {
      audioElement.value.pause()
    } else {
      audioElement.value.play()
    }
    isPlaying.value = !isPlaying.value
  }
}

const skipForward = () => {
  if (audioElement.value) {
    const newTime = Math.min(audioElement.value.currentTime + 15, duration.value)
    audioElement.value.currentTime = newTime
    currentTime.value = newTime
  }
}

const skipBackward = () => {
  if (audioElement.value) {
    const newTime = Math.max(audioElement.value.currentTime - 15, 0)
    audioElement.value.currentTime = newTime
    currentTime.value = newTime
  }
}

const handleProgressClick = (event: MouseEvent) => {
  if (progressBar.value && audioElement.value) {
    const rect = progressBar.value.getBoundingClientRect()
    const percent = (event.clientX - rect.left) / rect.width
    const newTime = percent * duration.value
    audioElement.value.currentTime = newTime
    currentTime.value = newTime
  }
}

const startDragging = (event: MouseEvent) => {
  isDragging.value = true
  handleProgressClick(event)
  
  const handleMouseMove = (e: MouseEvent) => {
    handleProgressClick(e)
  }
  
  const handleMouseUp = () => {
    isDragging.value = false
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }
  
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
}

const toggleMute = () => {
  if (audioElement.value) {
    isMuted.value = !isMuted.value
    audioElement.value.muted = isMuted.value
  }
}

const handleVolumeChange = () => {
  if (audioElement.value) {
    audioElement.value.volume = volume.value
    isMuted.value = volume.value === 0
  }
}

const toggleVolumePopup = (event: MouseEvent) => {
  event.stopPropagation()
  isVolumeOpen.value = !isVolumeOpen.value
  isSpeedOpen.value = false
}

const toggleSpeedPopup = (event: MouseEvent) => {
  event.stopPropagation()
  isSpeedOpen.value = !isSpeedOpen.value
  isVolumeOpen.value = false
}

const setPlaybackSpeed = (speed: number) => {
  playbackSpeed.value = speed
  if (audioElement.value) {
    audioElement.value.playbackRate = speed
  }
  isSpeedOpen.value = false
}

const seekTo = (time: number) => {
  if (audioElement.value) {
    audioElement.value.currentTime = time;
    currentTime.value = time;
  }
}

// Get audio element (for parent component)
const getAudioElement = () => audioElement.value;

// Add keyboard event listeners
const handleKeydown = (event: KeyboardEvent) => {
  // Only handle keyboard events if not typing in an input
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return
  }

  switch (event.code) {
    case 'Space':
      event.preventDefault()
      togglePlay()
      break
    case 'ArrowLeft':
      event.preventDefault()
      skipBackward()
      break
    case 'ArrowRight':
      event.preventDefault()
      skipForward()
      break
    case 'ArrowUp':
      event.preventDefault()
      if (volume.value < 1) {
        volume.value = Math.min(1, volume.value + 0.1)
        handleVolumeChange()
      }
      break
    case 'ArrowDown':
      event.preventDefault()
      if (volume.value > 0) {
        volume.value = Math.max(0, volume.value - 0.1)
        handleVolumeChange()
      }
      break
    case 'KeyM':
      event.preventDefault()
      toggleMute()
      break
  }
}

// Expose methods to parent
defineExpose({
  seek,
  seekTo,
  getAudioElement,
  togglePlay,
  skipForward,
  skipBackward
})

let volumeTimeout: ReturnType<typeof setTimeout> | null = null;
let speedTimeout: ReturnType<typeof setTimeout> | null = null;

const clearVolumeTimeout = () => {
  if (volumeTimeout) {
    clearTimeout(volumeTimeout);
    volumeTimeout = null;
  }
}

const startVolumeTimeout = () => {
  if (!volumeTimeout) {
    volumeTimeout = setTimeout(() => {
      volumeTimeout = null;
    }, 200);
  }
}

const clearSpeedTimeout = () => {
  if (speedTimeout) {
    clearTimeout(speedTimeout);
    speedTimeout = null;
  }
}

const startSpeedTimeout = () => {
  if (!speedTimeout) {
    speedTimeout = setTimeout(() => {
      speedTimeout = null;
    }, 200);
  }
}
</script>
