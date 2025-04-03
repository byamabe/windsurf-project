<template>
  <div ref="playerContainer" class="aspect-video bg-gray-900"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { loadYouTubeApi, getYouTubeVideoId } from '~/utils/youtube'

interface Props {
  videoId: string
  onTimeupdate?: (time: number) => void
  onSeeked?: (time: { start: number; end: number }) => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'timeupdate', time: number): void
  (e: 'seeked', time: { start: number, end: number }): void
}>()

const playerContainer = ref<HTMLElement>()
let player: any = null
let lastTime = 0

// Time tracking
let timeTrackingInterval: number | null = null

const startTimeTracking = () => {
  if (timeTrackingInterval) return
  timeTrackingInterval = window.setInterval(() => {
    if (player) {
      const currentTime = player.getCurrentTime()
      if (props.onTimeupdate) {
        props.onTimeupdate(currentTime)
        emit('timeupdate', currentTime)
      }
      if (Math.abs(currentTime - lastTime) > 1 && props.onSeeked) {
        props.onSeeked({ start: lastTime, end: currentTime })
        emit('seeked', { start: lastTime, end: currentTime })
      }
      lastTime = currentTime
    }
  }, 1000)
}

const stopTimeTracking = () => {
  if (timeTrackingInterval) {
    window.clearInterval(timeTrackingInterval)
    timeTrackingInterval = null
  }
}

// Initialize YouTube player
onMounted(async () => {
  await loadYouTubeApi()
  if (!playerContainer.value) return

  player = new window.YT.Player(playerContainer.value, {
    height: '100%',
    width: '100%',
    videoId: props.videoId,
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      playsinline: 1,
      rel: 0
    },
    events: {
      onStateChange: handleStateChange,
      onError: (event) => {
        console.error('YouTube player error:', event.data)
      }
    }
  })
})

// Handle player state changes
const handleStateChange = (event: { data: number }) => {
  if (event.data === window.YT.PlayerState.PLAYING) {
    startTimeTracking()
  } else {
    stopTimeTracking()
  }
}

// Cleanup
onUnmounted(() => {
  stopTimeTracking()
  if (player) {
    player.destroy()
    player = null
  }
})

// Expose methods
defineExpose({
  play: () => player?.playVideo(),
  pause: () => player?.pauseVideo(),
  seek: (time: number) => player?.seekTo(time, true),
  setVolume: (volume: number) => player?.setVolume(volume * 100),
  setSpeed: (speed: number) => player?.setPlaybackRate(speed)
})
</script>
