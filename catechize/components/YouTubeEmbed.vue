<template>
  <div class="relative w-full aspect-video">
    <div ref="playerContainer" class="absolute top-0 left-0 w-full h-full rounded-lg"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Type definitions for YouTube IFrame API
declare global {
  interface Window {
    YT: {
      Player: any;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

const props = defineProps<{
  videoUrl: string
}>()

const emit = defineEmits<{
  (e: 'timeupdate', time: number): void
}>()

const playerContainer = ref<HTMLDivElement | null>(null)
const player = ref<any>(null)
let timeTrackingInterval: number | null = null

const getVideoId = (url: string): string => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match?.[2] || ''
}

const startTimeTracking = () => {
  if (timeTrackingInterval) return
  timeTrackingInterval = window.setInterval(() => {
    if (player.value?.getCurrentTime) {
      emit('timeupdate', player.value.getCurrentTime())
    }
  }, 1000)
}

const stopTimeTracking = () => {
  if (timeTrackingInterval) {
    window.clearInterval(timeTrackingInterval)
    timeTrackingInterval = null
  }
}

const initPlayer = () => {
  const videoId = getVideoId(props.videoUrl)
  if (!videoId || !playerContainer.value) return

  player.value = new window.YT.Player(playerContainer.value, {
    videoId,
    playerVars: {
      playsinline: 1,
      modestbranding: 1,
      rel: 0
    },
    events: {
      onStateChange: (event: any) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
          startTimeTracking()
        } else {
          stopTimeTracking()
        }
      }
    }
  })
}

onMounted(() => {
  // Load YouTube IFrame API if not already loaded
  if (!window.YT) {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    if (firstScriptTag?.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }
  }

  // Initialize when API is ready
  if (window.YT?.Player) {
    initPlayer()
  } else {
    window.onYouTubeIframeAPIReady = initPlayer
  }
})

onUnmounted(() => {
  stopTimeTracking()
  if (player.value?.destroy) {
    player.value.destroy()
  }
})

// Method to seek to a specific time
const seekTo = (time: number) => {
  if (player.value?.seekTo) {
    player.value.seekTo(time)
    emit('timeupdate', time)
  }
}

defineExpose({
  seekTo
})
</script>
