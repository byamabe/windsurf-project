<template>
  <div class="flex flex-col gap-2 mt-4">
    <!-- Progress Bar with Buffered Regions -->
    <div class="relative w-full h-2 bg-gray-700 rounded cursor-pointer" @click="handleProgressClick">
      <!-- Buffered Regions -->
      <div
        v-for="(range, index) in buffered"
        :key="index"
        class="absolute top-0 h-full bg-gray-600 rounded"
        :style="{
          left: `${(range.start / duration) * 100}%`,
          width: `${((range.end - range.start) / duration) * 100}%`
        }"
      />
      <!-- Progress Bar -->
      <div
        class="absolute top-0 left-0 h-full bg-blue-500 rounded"
        :style="{ width: `${(currentTime / duration) * 100}%` }"
      />
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-4">
      <!-- Skip Backward -->
      <button
        class="p-2 text-white hover:text-blue-500 transition-colors"
        @click="$emit('skip-backward')"
      >
        <span class="i-heroicons-backward-20-solid w-5 h-5" />
      </button>

      <!-- Play/Pause Button -->
      <button
        class="p-2 text-white hover:text-blue-500 transition-colors"
        @click="isPlaying ? $emit('pause') : $emit('play')"
        :disabled="isLoading"
      >
        <span v-if="isLoading" class="i-heroicons-arrow-path-20-solid w-6 h-6 animate-spin" />
        <span v-else-if="isPlaying" class="i-heroicons-pause-20-solid w-6 h-6" />
        <span v-else class="i-heroicons-play-20-solid w-6 h-6" />
      </button>

      <!-- Skip Forward -->
      <button
        class="p-2 text-white hover:text-blue-500 transition-colors"
        @click="$emit('skip-forward')"
      >
        <span class="i-heroicons-forward-20-solid w-5 h-5" />
      </button>

      <!-- Time Display -->
      <div class="text-sm text-gray-400">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </div>

      <!-- Volume Control -->
      <div class="flex items-center gap-2">
        <button
          class="p-2 text-white hover:text-blue-500 transition-colors"
          @click="toggleMute"
        >
          <span
            v-if="volume === 0"
            class="i-heroicons-speaker-x-mark-20-solid w-5 h-5"
          />
          <span
            v-else-if="volume < 0.5"
            class="i-heroicons-speaker-wave-20-solid w-5 h-5"
          />
          <span
            v-else
            class="i-heroicons-speaker-wave-20-solid w-5 h-5"
          />
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          :value="volume"
          @input="handleVolumeChange"
          class="w-24"
        />
      </div>

      <!-- Playback Speed -->
      <div class="flex items-center gap-2">
        <button
          class="px-2 py-1 text-sm text-white hover:text-blue-500 transition-colors"
          @click="toggleSpeedMenu"
        >
          {{ speed }}x
        </button>
        <div
          v-if="showSpeedMenu"
          class="absolute bottom-full mb-2 bg-gray-800 rounded shadow-lg"
        >
          <div class="py-1">
            <button
              v-for="speedOption in speedOptions"
              :key="speedOption"
              class="block w-full px-4 py-1 text-sm text-white hover:bg-blue-500 transition-colors"
              @click="handleSpeedChange(speedOption)"
            >
              {{ speedOption }}x
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="text-sm text-red-500 mt-2">
      {{ error.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TimeRange } from '~/composables/useMediaPlayer'

interface Props {
  currentTime: number
  duration: number
  isPlaying: boolean
  isLoading: boolean
  volume: number
  speed: number
  buffered: TimeRange[]
  error: Error | null
}

const props = withDefaults(defineProps<Props>(), {
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  isLoading: false,
  volume: 1,
  speed: 1,
  buffered: () => [],
  error: null
})

const emit = defineEmits<{
  (e: 'play'): void
  (e: 'pause'): void
  (e: 'seek', time: number): void
  (e: 'volume-change', volume: number): void
  (e: 'speed-change', speed: number): void
  (e: 'skip-forward'): void
  (e: 'skip-backward'): void
}>()

// Speed control
const showSpeedMenu = ref(false)
const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]

const toggleSpeedMenu = () => {
  showSpeedMenu.value = !showSpeedMenu.value
}

const handleSpeedChange = (speed: number) => {
  emit('speed-change', speed)
  showSpeedMenu.value = false
}

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const handleProgressClick = (event: MouseEvent) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX - rect.left
  const percentage = x / rect.width
  emit('seek', percentage * props.duration)
}

const handleVolumeChange = (event: Event) => {
  const volume = parseFloat((event.target as HTMLInputElement).value)
  emit('volume-change', volume)
}

const toggleMute = () => {
  emit('volume-change', props.volume === 0 ? 1 : 0)
}
</script>
