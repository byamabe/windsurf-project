<template>
  <div class="flex flex-col w-full bg-black/50 backdrop-blur-sm px-4 py-2">
    <!-- Progress bar -->
    <div 
      class="group relative w-full h-1 bg-gray-600/50 cursor-pointer mb-2"
      @click="handleSeek"
      @mousemove="handleMouseMove"
      @mouseleave="isHovering = false"
    >
      <!-- Progress -->
      <div 
        class="absolute inset-0 bg-red-600 transform origin-left" 
        :style="{ transform: `scaleX(${getProgress})` }"
      ></div>
      <!-- Buffer -->
      <div 
        class="absolute inset-0 bg-white/20" 
        :style="{ transform: `scaleX(${props.buffered || 0})` }"
      ></div>
      <!-- Hover area -->
      <div class="absolute inset-0 h-1 group-hover:h-2 transition-all duration-200">
        <!-- Scrubber -->
        <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transform -translate-x-1/2" :style="{ left: `${getProgress * 100}%` }"></div>
        <!-- Preview time -->
        <div v-if="isHovering" class="absolute top-0 transform -translate-x-1/2 -translate-y-6 bg-black/90 text-white text-xs px-2 py-1 rounded" :style="{ left: `${hoverPosition * 100}%` }">
          {{ formatTime(hoverPosition * (props.duration || 0)) }}
        </div>
      </div>
    </div>
    
    <!-- Controls -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <!-- Play/Pause -->
        <button class="p-2 hover:bg-white/10 rounded-full transition-colors" @click="$emit('toggle-play')">
          <svg v-if="isPlaying" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
          </svg>
          <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>

        <!-- Skip buttons -->
        <button class="p-2 hover:bg-white/10 rounded-full transition-colors" @click="$emit('skip-backward')">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>
          </svg>
        </button>
        <button class="p-2 hover:bg-white/10 rounded-full transition-colors" @click="$emit('skip-forward')">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 6v12l8.5-6L13 6zM4 18l8.5-6L4 6v12z"/>
          </svg>
        </button>

        <!-- Time -->
        <span class="text-sm font-medium text-white/90 ml-2">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
      </div>

      <div class="flex items-center gap-2">
        <!-- Volume -->
        <div class="group relative flex items-center">
          <button class="p-2 hover:bg-white/10 rounded-full transition-colors" @click="$emit('volume-change', volume === 0 ? 1 : 0)">
            <svg v-if="volume > 0.5" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <svg v-else-if="volume > 0" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            :value="volume"
            @input="$emit('volume-change', ($event.target as HTMLInputElement).valueAsNumber)"
            class="w-0 group-hover:w-24 transition-all duration-200 opacity-0 group-hover:opacity-100 h-1 bg-white/20 rounded-full appearance-none cursor-pointer mx-2 hover:h-2"
            :style="{
              background: `linear-gradient(to right, white ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`
            }"
          >
        </div>

        <!-- Speed -->
        <select 
          :value="speed"
          @change="$emit('speed-change', Number(($event.target as HTMLSelectElement).value))"
          class="bg-transparent hover:bg-white/10 text-sm font-medium rounded-full px-3 py-1.5 cursor-pointer border-none focus:outline-none transition-colors"
        >
          <option value="0.5">0.5x</option>
          <option value="1">1x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  isPlaying: boolean
  currentTime: number
  duration: number
  buffered: number
  volume: number
  speed: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'toggle-play'): void
  (e: 'volume-change', value: number): void
  (e: 'speed-change', value: number): void
  (e: 'skip-forward'): void
  (e: 'skip-backward'): void
  (e: 'seek', value: number): void
}>()

const isHovering = ref(false)
const hoverPosition = ref(0)

const getProgress = computed(() => {
  console.log('[MediaControls] Progress', {
    currentTime: props.currentTime,
    duration: props.duration,
    progress: props.duration ? props.currentTime / props.duration : 0
  })
  return props.duration ? props.currentTime / props.duration : 0
})

const handleSeek = (event: MouseEvent) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const position = (event.clientX - rect.left) / rect.width
  emit('seek', position)
}

const handleMouseMove = (event: MouseEvent) => {
  isHovering.value = true
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  hoverPosition.value = (event.clientX - rect.left) / rect.width
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const toggleMute = () => {
  emit('volume-change', props.volume === 0 ? 1 : 0)
}
</script>

<style scoped>
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

select option {
  background: #1a1a1a;
  color: white;
}
</style>
