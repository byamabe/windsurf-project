<template>
  <div class="relative group bg-black text-white w-full">
    <!-- Video/Audio Element -->
    <component 
      v-if="props.type !== 'youtube'"
      :is="props.type" 
      :ref="setMediaRef"
      :src="props.src"
      class="w-full"
      preload="metadata"
      @loadedmetadata="handleLoadedMetadata"
      @durationchange="handleDurationChange"
      @timeupdate="handleTimeUpdate"
      @ended="handleEnded"
      @error="handleError"
      @play="handlePlay"
      @pause="handlePause"
      @seeking="handleSeeking"
      @seeked="handleSeeked"
      @waiting="handleWaiting"
      @canplay="handleCanPlay"
    />

    <!-- YouTube Element -->
    <div v-else ref="containerRef" class="aspect-video bg-black" />

    <!-- Controls overlay -->
    <div 
      v-if="props.type !== 'youtube'"
      class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end"
      :class="{ 'opacity-100': !isPlaying || isHovering }"
    >
      <MediaControls
        :is-playing="isPlaying"
        :current-time="currentTime"
        :duration="duration"
        :buffered="buffered"
        :volume="volume"
        :speed="speed"
        @toggle-play="controls.togglePlay"
        @seek="controls.seek"
        @volume-change="controls.setVolume"
        @speed-change="controls.setSpeed"
        @skip-forward="controls.skipForward"
        @skip-backward="controls.skipBackward"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMediaPlayer, type MediaPlayerState, type MediaSource } from '~/composables/useMediaPlayer'
import MediaControls from './MediaControls.vue'

interface Props {
  type: 'audio' | 'video' | 'youtube'
  src: string
  id: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'error', error: Error): void
}>()

const mediaRef = ref<HTMLMediaElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const isHovering = ref(false)

const source: MediaSource = {
  id: props.id,
  type: props.type,
  url: props.src
}

const { state, controls } = useMediaPlayer(source, containerRef)

// Computed properties for template
const isPlaying = computed(() => state.value.isPlaying)
const currentTime = computed(() => state.value.currentTime)
const duration = computed(() => state.value.duration)
const buffered = computed(() => {
  // Get the last buffered range end time as a percentage of duration
  const lastBuffered = state.value.buffered[state.value.buffered.length - 1]
  return lastBuffered ? lastBuffered.end / state.value.duration : 0
})
const volume = computed(() => state.value.volume)
const speed = computed(() => state.value.speed)

// Event handlers
const handleLoadedMetadata = () => {
  if (!mediaRef.value) return
  const element = mediaRef.value as HTMLMediaElement
  console.log('[MediaPlayer] Loaded metadata', {
    duration: element.duration,
    readyState: element.readyState,
    stateCurrentTime: state.value.currentTime
  })
  if (element.duration && !isNaN(element.duration)) {
    state.value.duration = element.duration
  }
  // Sync the media element with the restored state
  if (state.value.currentTime > 0) {
    console.log('[MediaPlayer] Restoring time position to:', state.value.currentTime)
    element.currentTime = state.value.currentTime
  }
}

const handleDurationChange = () => {
  if (!mediaRef.value) return
  const element = mediaRef.value as HTMLMediaElement
  console.log('[MediaPlayer] Duration change', {
    duration: element.duration,
    readyState: element.readyState,
    state: state.value
  })
  if (element.duration && !isNaN(element.duration)) {
    state.value.duration = element.duration
  }
}

const handleTimeUpdate = () => {
  if (!mediaRef.value) return
  const element = mediaRef.value as HTMLMediaElement
  console.log('[MediaPlayer] Time update', {
    currentTime: element.currentTime,
    duration: element.duration,
    readyState: element.readyState,
    state: state.value
  })
  state.value.currentTime = element.currentTime
}

const handleEnded = () => {
  state.value.isPlaying = false
  state.value.currentTime = 0
}

const handleError = (error: Error) => {
  state.value.error = error
  state.value.isLoading = true
  emit('error', error)
}

const handlePlay = () => {
  state.value.isPlaying = true
}

const handlePause = () => {
  state.value.isPlaying = false
}

const handleSeeking = () => {
  state.value.isLoading = true
}

const handleSeeked = () => {
  state.value.isLoading = false
}

const handleWaiting = () => {
  state.value.isLoading = true
}

const handleCanPlay = () => {
  state.value.isLoading = false
}

const setMediaRef = (el: HTMLMediaElement | null) => {
  mediaRef.value = el
  if (el) {
    // @ts-ignore - setMediaElement is added by useMediaPlayer
    controls.setMediaElement(el)
  }
}
</script>
