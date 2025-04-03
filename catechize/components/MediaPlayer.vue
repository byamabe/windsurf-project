<template>
  <div class="relative group bg-black text-white w-full">
    <!-- Video/Audio Element -->
    <component 
      v-if="props.type !== 'youtube'"
      :is="props.type" 
      ref="mediaRef"
      :src="props.src"
      class="w-full"
      @loadedmetadata="handleLoadedMetadata"
      @durationchange="handleDurationChange"
      @ended="handleEnded"
      @error="handleError"
      @play="isPlaying = true"
      @pause="isPlaying = false"
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
        :buffered="bufferedProgress"
        :volume="volume"
        :speed="speed"
        @toggle-play="togglePlay"
        @volume-change="handleVolumeChange"
        @speed-change="handleSpeedChange"
        @skip-forward="skipForward"
        @skip-backward="skipBackward"
        @seek="handleSeek"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, defineEmits, defineProps } from 'vue'
import MediaControls from './MediaControls.vue'
import { loadYouTubeApi } from '~/utils/youtube'

interface Props {
  type: 'audio' | 'video' | 'youtube';
  src: string;
  id: string;
  autoplay?: boolean;
  muted?: boolean;
}

interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  setVolume(value: number): void;
  setPlaybackRate(value: number): void;
  loadVideoById(videoId: string): void;
}

interface YouTubePlayerVars {
  autoplay?: 0 | 1;
  muted?: 0 | 1;
  controls?: 0 | 1;
  rel?: 0 | 1;
  modestbranding?: 0 | 1;
}

interface YouTubeEvent {
  target: YouTubePlayer;
  data: number;
}

interface PlayerEvent {
  target: any;
  data?: number;
}

declare global {
  interface Window {
    YT: {
      Player: new (element: HTMLElement, config: any) => any;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        ENDED: number;
      };
    };
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'error', error: unknown): void
}>()

const mediaRef = ref<HTMLMediaElement | YouTubePlayer | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const speed = ref(1)
const isHovering = ref(false)
const bufferedProgress = ref(0)
const isReady = ref(false)

// Storage key for playback position
const getStorageKey = () => `media-position-${props.id}`

// Save and restore position
const savePosition = () => {
  if (currentTime.value > 0) {
    localStorage.setItem(getStorageKey(), currentTime.value.toString())
  }
}

const restorePosition = () => {
  if (!mediaRef.value) return
  const savedTime = localStorage.getItem(getStorageKey())
  if (!savedTime) return

  const time = parseFloat(savedTime)
  if (isNaN(time)) return

  if (props.type === 'youtube') {
    if (!isReady.value) return
    (mediaRef.value as YouTubePlayer).seekTo(time, true)
  } else {
    const htmlMedia = mediaRef.value as HTMLMediaElement
    if (!isNaN(htmlMedia.duration) && htmlMedia.duration > 0) {
      htmlMedia.currentTime = time
      currentTime.value = time
    }
  }
}

// Time tracking
const updateCurrentTime = () => {
  if (!mediaRef.value) return
  if (props.type === 'youtube') {
    if (isReady.value) {
      currentTime.value = (mediaRef.value as YouTubePlayer).getCurrentTime()
      if (duration.value === 0) {
        const dur = (mediaRef.value as YouTubePlayer).getDuration()
        if (dur > 0) duration.value = dur
      }
    }
  } else {
    const htmlMedia = mediaRef.value as HTMLMediaElement
    currentTime.value = htmlMedia.currentTime
    if (duration.value === 0 && !isNaN(htmlMedia.duration) && htmlMedia.duration > 0) {
      duration.value = htmlMedia.duration
    }
  }
  savePosition()
}

let timeTracker: ReturnType<typeof setInterval> | null = null

const startTimeTracking = () => {
  stopTimeTracking()
  timeTracker = setInterval(updateCurrentTime, 200)
}

const stopTimeTracking = () => {
  if (timeTracker) {
    clearInterval(timeTracker)
    timeTracker = null
  }
}

// Handle duration and metadata
const handleLoadedMetadata = () => {
  if (!mediaRef.value) return
  
  if (props.type === 'youtube') {
    // For YouTube, duration will be set in updateCurrentTime since it may not be ready yet
    isReady.value = true
    startTimeTracking()
  } else {
    const htmlMedia = mediaRef.value as HTMLMediaElement
    if (!isNaN(htmlMedia.duration) && htmlMedia.duration > 0) {
      duration.value = htmlMedia.duration
      isReady.value = true
      startTimeTracking()
    }
  }
}

// Handle duration changes for HTML media
const handleDurationChange = () => {
  if (!mediaRef.value || props.type === 'youtube') return
  const htmlMedia = mediaRef.value as HTMLMediaElement
  if (!isNaN(htmlMedia.duration) && htmlMedia.duration > 0) {
    duration.value = htmlMedia.duration
  }
}

// Handle seek
const handleSeek = (position: number) => {
  if (!mediaRef.value || position < 0 || position > 1) return
  
  const time = position * duration.value
  if (isNaN(time)) return
  
  if (props.type === 'youtube') {
    (mediaRef.value as YouTubePlayer).seekTo(time, true)
  } else {
    (mediaRef.value as HTMLMediaElement).currentTime = time
  }
  currentTime.value = time
}

// Methods
const togglePlay = () => {
  if (!mediaRef.value) return
  if (isPlaying.value) {
    if (props.type === 'youtube') {
      (mediaRef.value as YouTubePlayer).pauseVideo()
    } else {
      (mediaRef.value as HTMLMediaElement).pause()
    }
  } else {
    if (props.type === 'youtube') {
      (mediaRef.value as YouTubePlayer).playVideo()
    } else {
      (mediaRef.value as HTMLMediaElement).play()
    }
  }
}

const handleVolumeChange = (value: number) => {
  if (!mediaRef.value) return
  volume.value = value
  if (props.type === 'youtube') {
    (mediaRef.value as YouTubePlayer).setVolume(value * 100)
  } else {
    (mediaRef.value as HTMLMediaElement).volume = value
  }
}

const handleSpeedChange = (value: number) => {
  if (!mediaRef.value) return
  speed.value = value
  if (props.type === 'youtube') {
    (mediaRef.value as YouTubePlayer).setPlaybackRate(value)
  } else {
    (mediaRef.value as HTMLMediaElement).playbackRate = value
  }
}

const skipForward = () => {
  if (!mediaRef.value) return
  if (props.type === 'youtube') {
    (mediaRef.value as YouTubePlayer).seekTo((mediaRef.value as YouTubePlayer).getCurrentTime() + 10, true)
  } else {
    (mediaRef.value as HTMLMediaElement).currentTime = Math.min((mediaRef.value as HTMLMediaElement).currentTime + 10, duration.value)
  }
}

const skipBackward = () => {
  if (!mediaRef.value) return
  if (props.type === 'youtube') {
    (mediaRef.value as YouTubePlayer).seekTo((mediaRef.value as YouTubePlayer).getCurrentTime() - 10, true)
  } else {
    (mediaRef.value as HTMLMediaElement).currentTime = Math.max((mediaRef.value as HTMLMediaElement).currentTime - 10, 0)
  }
}

const handleEnded = () => {
  isPlaying.value = false
}

const handleError = (error?: unknown) => {
  console.error('Media error:', error)
  emit('error', error)
}

// Initialize YouTube player
const initYouTubePlayer = async () => {
  if (props.type !== 'youtube' || !containerRef.value) return
  
  await loadYouTubeApi()
  const videoId = String(props.src).split('v=')[1]
  if (!videoId) return

  const player = new window.YT.Player(containerRef.value, {
    videoId,
    playerVars: {
      autoplay: props.autoplay ? 1 : 0,
      mute: props.muted ? 1 : 0,
      controls: 1,
      rel: 0,
      modestbranding: 1,
    },
    events: {
      onReady: (event: PlayerEvent) => {
        mediaRef.value = event.target as unknown as YouTubePlayer
        // Get duration first
        const dur = (mediaRef.value as YouTubePlayer).getDuration()
        if (dur > 0) {
          duration.value = dur
          isReady.value = true
          startTimeTracking()
          // Now restore position
          restorePosition()
        }
      },
      onStateChange: (event: PlayerEvent) => {
        isPlaying.value = event.data === window.YT.PlayerState.PLAYING
        if (event.data === window.YT.PlayerState.ENDED) {
          handleEnded()
        }
      },
      onError: handleError
    }
  })
}

// Watch for source changes
watch(() => props.src, (newSrc: string) => {
  if (!mediaRef.value) return
  if (props.type === 'youtube') {
    const videoId = String(newSrc).split('v=')[1]
    if (videoId) {
      (mediaRef.value as YouTubePlayer).loadVideoById(videoId)
    }
  } else {
    const htmlMedia = mediaRef.value as HTMLMediaElement
    htmlMedia.src = newSrc
    htmlMedia.load()
  }
})

// Lifecycle
onMounted(() => {
  if (props.type === 'youtube') {
    initYouTubePlayer()
  } else {
    // For HTML media, try to load it first
    const htmlMedia = mediaRef.value as HTMLMediaElement
    if (htmlMedia) {
      // Force load the media to get duration
      htmlMedia.load()
      // Listen for metadata
      htmlMedia.addEventListener('loadedmetadata', () => {
        if (!isNaN(htmlMedia.duration) && htmlMedia.duration > 0) {
          duration.value = htmlMedia.duration
          isReady.value = true
          startTimeTracking()
          restorePosition()
        }
      })
      // Also listen for duration changes
      htmlMedia.addEventListener('durationchange', () => {
        if (!isNaN(htmlMedia.duration) && htmlMedia.duration > 0) {
          duration.value = htmlMedia.duration
          if (!isReady.value) {
            isReady.value = true
            startTimeTracking()
            restorePosition()
          }
        }
      })
    }
  }
})

onUnmounted(() => {
  // Save final position before cleanup
  savePosition()
  stopTimeTracking()
  if (mediaRef.value) {
    if (props.type === 'youtube') {
      (mediaRef.value as YouTubePlayer).stopVideo()
    } else {
      (mediaRef.value as HTMLMediaElement).pause()
    }
  }
})
</script>
