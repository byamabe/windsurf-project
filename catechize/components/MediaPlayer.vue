<template>
  <div class="relative">
    <!-- Container for video/youtube content -->
    <div v-if="type !== 'audio'" ref="containerRef" class="aspect-video rounded-lg bg-gray-900"></div>

    <!-- Media Controls -->
    <MediaControls
      :current-time="currentTime"
      :duration="duration"
      :is-playing="isPlaying"
      :is-loading="isLoading"
      :volume="volume"
      :speed="speed"
      :buffered="buffered"
      :error="error"
      @play="controls.play"
      @pause="controls.pause"
      @seek="controls.seek"
      @volume-change="controls.setVolume"
      @speed-change="controls.setSpeed"
      @skip-forward="controls.skipForward"
      @skip-backward="controls.skipBackward"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useMediaPlayer, type MediaSource } from '~/composables/useMediaPlayer'
import MediaControls from './MediaControls.vue'

interface Props {
  type: 'audio' | 'video' | 'youtube'
  url: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'timeupdate', time: number): void
  (e: 'seeked', time: { start: number; end: number }): void
  (e: 'error', error: Error): void
}>()

// Container ref for video/youtube content
const containerRef = ref<HTMLElement | null>(null)

// Track last time for seek events
let lastTime = 0

// Use the media player composable
const source = computed<MediaSource>(() => ({
  type: props.type,
  url: props.url
}))

const { state, controls, formatTime } = useMediaPlayer(source.value, containerRef)

// Computed properties for template
const currentTime = computed(() => state.value.currentTime)
const duration = computed(() => state.value.duration)
const isPlaying = computed(() => state.value.isPlaying)
const isLoading = computed(() => state.value.isLoading)
const volume = computed(() => state.value.volume)
const speed = computed(() => state.value.speed)
const buffered = computed(() => state.value.buffered)
const error = computed(() => state.value.error)

// Watch for state changes and emit events
watch(currentTime, (time) => {
  emit('timeupdate', time)
  if (Math.abs(time - lastTime) > 1) {
    emit('seeked', { start: lastTime, end: time })
  }
  lastTime = time
})

watch(error, (err) => {
  if (err) emit('error', err)
})

// Watch for source changes
watch(source, (newSource) => {
  // Reset player when source changes
  controls.pause()
  state.value.currentTime = 0
  state.value.duration = 0
  state.value.isLoading = true
  state.value.error = null
  lastTime = 0
})

// Re-export useful utilities
defineExpose({
  play: controls.play,
  pause: controls.pause,
  seek: controls.seek,
  setVolume: controls.setVolume,
  setSpeed: controls.setSpeed,
  formatTime
})
</script>
